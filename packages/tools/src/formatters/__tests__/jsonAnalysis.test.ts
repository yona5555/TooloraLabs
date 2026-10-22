import { describe, expect, it } from "vitest";
import { analyzeJSON, foldJSON } from "../jsonAnalysis";

const text = '{"a":[1,2.5,{"b":null}],"c":"héllo","d":true,"a2":{"b":false}}';
const value = JSON.parse(text);

describe("analyzeJSON", () => {
  const a = analyzeJSON(value, text);

  it("counts kinds, nodes and depth like JSONFormatter's stats", () => {
    expect(a.kinds).toEqual({ object: 3, array: 1, string: 1, number: 2, boolean: 2, null: 1 });
    expect(a.nodes).toBe(10);
    expect(a.depthCounts).toEqual([1, 4, 4, 1]);
    expect(a.maxDepth).toBe(4);
    expect(a.deepestPath.map((s) => s.key)).toEqual(["$", "a", "[2]", "b"]);
  });

  it("splits the minified bytes exactly", () => {
    expect(a.bytes.total).toBe(a.sizes.minified);
    expect(a.sizes.minified).toBe(new TextEncoder().encode(text).length);
    expect(a.bytes.literals).toBe(4 + 4 + 5);
    expect(a.bytes.numbers).toBe(1 + 3);
  });

  it("ranks keys and top-level members", () => {
    expect(a.keyFrequency[0]).toEqual({ key: "b", count: 2 });
    expect(a.totalKeys).toBe(6);
    expect(a.topLevel[0].key).toBe("a");
    expect(a.sizes.indent2).toBeGreaterThan(a.sizes.minified);
    expect(a.formattedLines).toBe(JSON.stringify(value, null, 2).split("\n").length);
  });

  it("summarises strings, numbers and arrays", () => {
    expect(a.strings.maxLength).toBe(5);
    expect(a.strings.buckets[1].count).toBe(1);
    expect(a.numbers).toMatchObject({ count: 2, integers: 1, min: 1, max: 2.5 });
    expect(a.arrays).toEqual({ count: 1, totalItems: 3, maxLength: 3 });
  });
});

describe("foldJSON", () => {
  it("collapses containers deeper than the fold depth", () => {
    expect(foldJSON(value, 1)).toBe('{\n  "a": […3],\n  "c": "héllo",\n  "d": true,\n  "a2": {…1}\n}');
    expect(foldJSON(value, 9)).toBe(JSON.stringify(value, null, 2));
  });
});
