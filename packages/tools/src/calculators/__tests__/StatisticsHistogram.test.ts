import { describe, it, expect } from "vitest";
import { buildHistogram, computeQuartiles, sturgesBinCount } from "../StatisticsHistogram";

describe("sturgesBinCount", () => {
  it("follows ⌈log₂ n⌉ + 1 and clamps", () => {
    expect(sturgesBinCount(1)).toBe(1);
    expect(sturgesBinCount(8)).toBe(4);
    expect(sturgesBinCount(9)).toBe(5);
    expect(sturgesBinCount(100000)).toBe(12);
  });
});

describe("buildHistogram", () => {
  it("counts every value exactly once, max in the last bin", () => {
    const h = buildHistogram([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(h.binCount).toBe(4);
    expect(h.binWidth).toBeCloseTo(1.75);
    expect(h.bins.map((b) => b.count)).toEqual([1, 5, 1, 1]);
    expect(h.bins.reduce((s, b) => s + b.count, 0)).toBe(8);
    expect(h.bins[3].end).toBe(9);
    expect(h.maxCount).toBe(5);
    expect(h.bins[1].relative).toBeCloseTo(0.625);
  });
  it("handles constant and empty data", () => {
    const c = buildHistogram([5, 5, 5]);
    expect(c.bins).toEqual([{ start: 4.5, end: 5.5, count: 3, relative: 1 }]);
    expect(buildHistogram([]).bins).toEqual([]);
  });
  it("respects a bin-count override", () => {
    expect(buildHistogram([1, 2, 3, 4], 2).bins.map((b) => b.count)).toEqual([2, 2]);
  });
});

describe("computeQuartiles", () => {
  it("uses Tukey hinges", () => {
    expect(computeQuartiles([2, 4, 4, 4, 5, 5, 7, 9])).toEqual({ q1: 4, q2: 4.5, q3: 6, iqr: 2 });
    expect(computeQuartiles([1, 2, 3, 4, 5])).toEqual({ q1: 1.5, q2: 3, q3: 4.5, iqr: 3 });
    expect(computeQuartiles([7]).iqr).toBe(0);
  });
});
