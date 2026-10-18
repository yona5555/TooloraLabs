/**
 * Inspection and planning helpers for the PDF Merge & Split tool: sample documents generated in
 * memory (so the page opens on a real result), page counts and page sizes read with pdf-lib, the
 * standard paper each page matches, how a range string parses, and which pages each split part takes.
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PageRange } from "./PdfMergeSplit";

export type PaperName = "A3" | "A4" | "A5" | "Letter" | "Legal" | "Tabloid" | "other";

/** ISO 216 and US paper sizes in PostScript points (1 pt = 1/72 in), portrait. */
export const PAPER_SIZES: Record<Exclude<PaperName, "other">, [number, number]> = {
  A3: [842, 1191],
  A4: [595, 842],
  A5: [420, 595],
  Letter: [612, 792],
  Legal: [612, 1008],
  Tabloid: [792, 1224],
};

export const PT_TO_MM = 25.4 / 72;

export function paperName(width: number, height: number): { name: PaperName; landscape: boolean } {
  const short = Math.min(width, height);
  const long = Math.max(width, height);
  for (const [name, [w, h]] of Object.entries(PAPER_SIZES) as [Exclude<PaperName, "other">, [number, number]][]) {
    if (Math.abs(short - w) <= 3 && Math.abs(long - h) <= 3) return { name, landscape: width > height };
  }
  return { name: "other", landscape: width > height };
}

export type PdfInfo = { pageCount: number; pageSizes: { width: number; height: number }[]; bytes: number };

export async function inspectPdf(file: Uint8Array): Promise<PdfInfo> {
  const doc = await PDFDocument.load(file);
  return { pageCount: doc.getPageCount(), pageSizes: doc.getPages().map((p) => p.getSize()), bytes: file.length };
}

/** A small real PDF: one heading and page number per page, on A4 or US Letter. */
export async function createSamplePdf(title: string, pageCount: number, paper: "A4" | "Letter"): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const [w, h] = PAPER_SIZES[paper];
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([w, h]);
    page.drawText(title, { x: 56, y: h - 80, size: 24, font: bold, color: rgb(0.15, 0.39, 0.92) });
    page.drawText(`Page ${i} of ${pageCount} - ${paper}`, { x: 56, y: h - 112, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
    for (let line = 0; line < 12; line++) page.drawText("Sample content generated in your browser with pdf-lib.", { x: 56, y: h - 160 - line * 20, size: 11, font, color: rgb(0.45, 0.45, 0.45) });
  }
  return doc.save();
}

export type RangeToken = { text: string; range: PageRange | null };

/** Every comma-separated token of a range string, with the range it yields (null when skipped). */
export function describeRanges(input: string): RangeToken[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => {
      const m = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(text);
      if (!m) return { text, range: null };
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : start;
      return { text, range: start > 0 && end >= start ? { start, end } : null };
    });
}

export type SplitPlan = {
  parts: { start: number; end: number; pages: number }[];
  /** coverage[i] = how many parts include page i + 1. */
  coverage: number[];
  unused: number;
  repeated: number;
  /** Ranges that fall entirely past the last page. */
  dropped: number;
};

/** What splitPdf will produce: ranges clamped to the document, or one part per page when none are given. */
export function planSplit(pageCount: number, ranges: PageRange[]): SplitPlan {
  const effective = ranges.length ? ranges : Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }));
  const coverage = new Array(pageCount).fill(0);
  const parts: SplitPlan["parts"] = [];
  let dropped = 0;
  for (const r of effective) {
    const start = Math.max(1, r.start);
    const end = Math.min(pageCount, r.end);
    if (start > end) {
      dropped++;
      continue;
    }
    parts.push({ start, end, pages: end - start + 1 });
    for (let p = start; p <= end; p++) coverage[p - 1]++;
  }
  return { parts, coverage, unused: coverage.filter((c) => c === 0).length, repeated: coverage.filter((c) => c > 1).length, dropped };
}

/** "1-2,3-4,…" ranges that cut a document into chunks of n pages. */
export function chunkRanges(pageCount: number, n: number): string {
  const out: string[] = [];
  for (let s = 1; s <= pageCount; s += n) {
    const e = Math.min(pageCount, s + n - 1);
    out.push(s === e ? String(s) : `${s}-${e}`);
  }
  return out.join(",");
}
