import { describe, expect, it } from "vitest";
import { analyzeDedupe } from "../dedupeAnalysis";
import { DuplicateLineRemover } from "../DuplicateLineRemover";

const text = "a@x.com\nb@x.com\nA@x.com\n\n  b@x.com\na@x.com\nc@x.com";

describe("analyzeDedupe", () => {
  it("follows the tool's fates and counts", () => {
    const input = { text, caseSensitive: true, trimWhitespace: true };
    const out = new DuplicateLineRemover().execute(input, { locale: "en-US" }).data;
    const a = analyzeDedupe(input, out.result);
    expect(a.lines.filter((l) => l.kept).map((l) => l.line).join("\n")).toBe(out.result);
    expect(a.lines.length).toBe(out.totalLines);
    expect(a.blankLines).toBe(1);
    expect(a.uniqueSoFar).toEqual([1, 2, 3, 3, 3, 4]);
    expect(a.repeatHistogram).toEqual([2, 2, 0, 0, 0]);
    expect(a.lines[3]).toMatchObject({ line: "b@x.com", kept: false, firstPosition: 2, occurrences: 2 });
    expect(a.modes).toEqual({ strict: 5, ignoreCase: 4, ignoreCaseAndSpace: 3 });
    expect(a.variantGroups.map((g) => g.canonical).sort()).toEqual(["a@x.com", "b@x.com"]);
  });

  it("keep-last marks the last occurrence", () => {
    const input = { text: "x\ny\nx", keepOccurrence: "last" as const };
    const a = analyzeDedupe(input, "y\nx");
    expect(a.lines.map((l) => l.kept)).toEqual([false, true, true]);
  });
});
