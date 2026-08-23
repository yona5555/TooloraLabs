import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs, splitPdf, getPdfPageCount, parsePageRanges } from "../PdfMergeSplit";

async function makePdf(pageCount: number, label: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([200, 200]);
    page.drawText(`${label}-${i + 1}`, { x: 20, y: 100 });
  }
  return doc.save();
}

describe("mergePdfs", () => {
  it("merges two PDFs into one with the combined page count", async () => {
    const a = await makePdf(2, "a");
    const b = await makePdf(3, "b");
    const merged = await mergePdfs([a, b]);
    expect(await getPdfPageCount(merged)).toBe(5);
  });

  it("preserves the order files were given in", async () => {
    const a = await makePdf(1, "first");
    const b = await makePdf(1, "second");
    const merged = await mergePdfs([a, b]);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(2);
  });

  it("merges a single file into an equivalent document", async () => {
    const a = await makePdf(4, "solo");
    const merged = await mergePdfs([a]);
    expect(await getPdfPageCount(merged)).toBe(4);
  });
});

describe("splitPdf", () => {
  it("splits every page into its own PDF when no ranges are given", async () => {
    const source = await makePdf(3, "page");
    const parts = await splitPdf(source);
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(await getPdfPageCount(part)).toBe(1);
    }
  });

  it("splits into custom page ranges", async () => {
    const source = await makePdf(6, "page");
    const parts = await splitPdf(source, [
      { start: 1, end: 2 },
      { start: 3, end: 6 },
    ]);
    expect(parts).toHaveLength(2);
    expect(await getPdfPageCount(parts[0])).toBe(2);
    expect(await getPdfPageCount(parts[1])).toBe(4);
  });

  it("clamps a range that extends past the last page", async () => {
    const source = await makePdf(3, "page");
    const parts = await splitPdf(source, [{ start: 2, end: 100 }]);
    expect(parts).toHaveLength(1);
    expect(await getPdfPageCount(parts[0])).toBe(2);
  });

  it("skips a range that starts after the document ends", async () => {
    const source = await makePdf(2, "page");
    const parts = await splitPdf(source, [{ start: 5, end: 6 }]);
    expect(parts).toHaveLength(0);
  });
});

describe("parsePageRanges", () => {
  it("parses a mix of single pages and ranges", () => {
    expect(parsePageRanges("1-3,5,8-9")).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 9 },
    ]);
  });

  it("ignores invalid or empty tokens", () => {
    expect(parsePageRanges("1-3,,abc,5")).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
    ]);
  });

  it("drops a range where the end is before the start", () => {
    expect(parsePageRanges("5-2,3")).toEqual([{ start: 3, end: 3 }]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parsePageRanges("")).toEqual([]);
  });
});
