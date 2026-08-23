import { PDFDocument } from "pdf-lib";

export type PageRange = { start: number; end: number };

/**
 * Merges multiple PDF byte buffers into a single PDF, in the given order,
 * by copying every page of each source document into a new document.
 * All processing happens with pdf-lib, which works entirely in memory —
 * no file is ever uploaded anywhere.
 */
export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(file);
    const pageIndices = source.getPageIndices();
    const copiedPages = await merged.copyPages(source, pageIndices);
    for (const page of copiedPages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}

/**
 * Splits a single PDF's pages into one PDF per page range. With no ranges
 * given, splits every page into its own single-page PDF. Ranges are
 * 1-indexed and inclusive on both ends, matching how page numbers are
 * shown to users.
 */
export async function splitPdf(file: Uint8Array, ranges?: PageRange[]): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(file);
  const pageCount = source.getPageCount();

  const effectiveRanges: PageRange[] = ranges?.length
    ? ranges
    : Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }));

  const outputs: Uint8Array[] = [];

  for (const range of effectiveRanges) {
    const start = Math.max(1, range.start);
    const end = Math.min(pageCount, range.end);
    if (start > end) continue;

    const doc = await PDFDocument.create();
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const copiedPages = await doc.copyPages(source, indices);
    for (const page of copiedPages) {
      doc.addPage(page);
    }
    outputs.push(await doc.save());
  }

  return outputs;
}

export async function getPdfPageCount(file: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(file);
  return doc.getPageCount();
}

const RANGE_TOKEN = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/;

/**
 * Parses a comma-separated page range string like "1-3,5,8-9" into
 * structured PageRange objects. Invalid or empty tokens are skipped
 * rather than throwing, since this is meant to parse live user input.
 */
export function parsePageRanges(input: string): PageRange[] {
  return input
    .split(",")
    .map((token) => RANGE_TOKEN.exec(token))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;
      return { start, end };
    })
    .filter((range) => range.start > 0 && range.end >= range.start);
}
