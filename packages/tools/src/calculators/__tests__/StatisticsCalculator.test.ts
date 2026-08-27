import { describe, it, expect } from "vitest";
import { StatisticsCalculator } from "../StatisticsCalculator";

const context = { locale: "en-US" };
const calc = new StatisticsCalculator();

describe("StatisticsCalculator", () => {
  it("computes basic statistics for an odd-length data set", () => {
    const r = calc.execute({ values: [2, 4, 4, 4, 5, 5, 7, 9] }, context);
    expect(r.data.count).toBe(8);
    expect(r.data.sum).toBe(40);
    expect(r.data.mean).toBe(5);
    expect(r.data.median).toBe(4.5);
    expect(r.data.mode).toEqual([4]);
    expect(r.data.min).toBe(2);
    expect(r.data.max).toBe(9);
    expect(r.data.range).toBe(7);
  });

  it("computes population and sample variance/std dev correctly", () => {
    const r = calc.execute({ values: [2, 4, 4, 4, 5, 5, 7, 9] }, context);
    expect(r.data.populationVariance).toBeCloseTo(4, 10);
    expect(r.data.populationStdDev).toBeCloseTo(2, 10);
    expect(r.data.sampleVariance).toBeCloseTo(4.571428571, 5);
    expect(r.data.sampleStdDev).toBeCloseTo(2.13809, 4);
  });

  it("computes median for an even-length sorted set", () => {
    const r = calc.execute({ values: [1, 2, 3, 4] }, context);
    expect(r.data.median).toBe(2.5);
  });

  it("returns an empty mode array when every value is unique", () => {
    const r = calc.execute({ values: [1, 2, 3, 4] }, context);
    expect(r.data.mode).toEqual([]);
  });

  it("returns multiple modes when tied", () => {
    const r = calc.execute({ values: [1, 1, 2, 2, 3] }, context);
    expect(r.data.mode).toEqual([1, 2]);
  });

  it("handles unsorted input", () => {
    const r = calc.execute({ values: [9, 1, 5, 3] }, context);
    expect(r.data.min).toBe(1);
    expect(r.data.max).toBe(9);
    expect(r.data.median).toBe(4);
  });

  it("flags an empty data set", () => {
    const r = calc.execute({ values: [] }, context);
    expect(r.data.error).toBe("empty-dataset");
  });

  it("handles a single-value data set without dividing by zero", () => {
    const r = calc.execute({ values: [42] }, context);
    expect(r.data.mean).toBe(42);
    expect(r.data.populationStdDev).toBe(0);
    expect(r.data.sampleStdDev).toBe(0);
  });
});
