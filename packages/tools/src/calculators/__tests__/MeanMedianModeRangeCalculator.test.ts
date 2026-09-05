import { describe, it, expect } from "vitest";
import { MeanMedianModeRangeCalculator } from "../MeanMedianModeRangeCalculator";

const context = { locale: "en-US" };
const calc = new MeanMedianModeRangeCalculator();

describe("MeanMedianModeRangeCalculator", () => {
  it("computes mean, median, mode, and range for an odd-length data set with one mode", () => {
    const r = calc.execute({ values: [4, 8, 6, 2, 8, 5] }, context);
    expect(r.data.mean).toBeCloseTo(33 / 6, 10);
    expect(r.data.sortedValues).toEqual([2, 4, 5, 6, 8, 8]);
    expect(r.data.median).toBe(5.5);
    expect(r.data.mode).toEqual([8]);
    expect(r.data.hasMode).toBe(true);
    expect(r.data.min).toBe(2);
    expect(r.data.max).toBe(8);
    expect(r.data.range).toBe(6);
  });

  it("computes the median for an odd-length data set as the middle value", () => {
    const r = calc.execute({ values: [7, 1, 3] }, context);
    expect(r.data.median).toBe(3);
  });

  it("reports no mode when every value is unique", () => {
    const r = calc.execute({ values: [1, 2, 3, 4] }, context);
    expect(r.data.mode).toEqual([]);
    expect(r.data.hasMode).toBe(false);
  });

  it("reports multiple modes for a multimodal data set", () => {
    const r = calc.execute({ values: [1, 1, 2, 2, 3] }, context);
    expect(r.data.mode).toEqual([1, 2]);
    expect(r.data.hasMode).toBe(true);
  });

  it("returns a range of zero when every value is identical", () => {
    const r = calc.execute({ values: [5, 5, 5] }, context);
    expect(r.data.range).toBe(0);
    expect(r.data.mode).toEqual([5]);
  });

  it("flags an empty data set as an error", () => {
    const r = calc.execute({ values: [] }, context);
    expect(r.data.error).toBe("empty-dataset");
  });
});
