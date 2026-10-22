import { describe, expect, it } from "vitest";
import { chunkRanges, createSamplePdf, describeRanges, inspectPdf, paperName, planSplit } from "../pdfAnalysis";
import { mergePdfs, parsePageRanges, splitPdf } from "../PdfMergeSplit";

describe("pdfAnalysis", () => {
  it("creates, inspects and merges real sample PDFs", async () => {
    const a = await createSamplePdf("Report", 3, "A4");
    const b = await createSamplePdf("Invoice", 2, "Letter");
    const ia = await inspectPdf(a);
    expect(ia.pageCount).toBe(3);
    expect(paperName(ia.pageSizes[0].width, ia.pageSizes[0].height)).toEqual({ name: "A4", landscape: false });
    const merged = await inspectPdf(await mergePdfs([a, b]));
    expect(merged.pageCount).toBe(5);
    expect(paperName(merged.pageSizes[4].width, merged.pageSizes[4].height).name).toBe("Letter");
  });

  it("plans splits exactly like splitPdf", async () => {
    const doc = await createSamplePdf("Handbook", 6, "A4");
    const ranges = parsePageRanges("1-2,3,5-9,12");
    const plan = planSplit(6, ranges);
    expect(plan.parts).toEqual([
      { start: 1, end: 2, pages: 2 },
      { start: 3, end: 3, pages: 1 },
      { start: 5, end: 6, pages: 2 },
    ]);
    expect(plan.unused).toBe(1);
    expect(plan.dropped).toBe(1);
    expect((await splitPdf(doc, ranges)).length).toBe(plan.parts.length);
  });

  it("describes ranges and builds chunks", () => {
    expect(describeRanges("1-3, x, 5").map((t) => t.range)).toEqual([{ start: 1, end: 3 }, null, { start: 5, end: 5 }]);
    expect(chunkRanges(7, 3)).toBe("1-3,4-6,7");
    expect(paperName(842, 595)).toEqual({ name: "A4", landscape: true });
    expect(paperName(500, 500).name).toBe("other");
  });
});
