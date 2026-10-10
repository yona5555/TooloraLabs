import { describe, it, expect } from "vitest";
import { analyzeDataSet, frequencyTable } from "../MeanMedianModeRangeAnalysis";

describe("analyzeDataSet", () => {
  it("returns null for an empty data set", () => {
    expect(analyzeDataSet([])).toBeNull();
  });

  it("breaks down the default data set", () => {
    const a = analyzeDataSet([4, 8, 6, 2, 8, 5])!;
    expect(a.sorted).toEqual([2, 4, 5, 6, 8, 8]);
    expect(a.sum).toBe(33);
    expect(a.mean).toBe(5.5);
    expect(a.median).toBe(5.5);
    expect(a.medianPositions).toEqual([3, 4]);
    expect(a.medianRank).toBe(3.5);
    expect(a.modes).toEqual([8]);
    expect(a.maxFrequency).toBe(2);
    expect(a.range).toBe(6);
    expect(a.midrange).toBe(5);
    expect(a.q1).toBe(4);
    expect(a.q3).toBe(8);
    expect(a.iqr).toBe(4);
    expect(a.outliers).toEqual([]);
    expect(a.sumDeviations).toBe(0);
    expect(a.sumAbsDevMean).toBe(11);
    expect(a.sumAbsDevMedian).toBe(11);
    expect(a.pearsonSkew).toBe(0);
  });

  it("flags an outlier, a positive skew and the median's robustness", () => {
    const a = analyzeDataSet([10, 12, 11, 13, 12, 50])!;
    expect(a.mean).toBeCloseTo(18, 10);
    expect(a.median).toBe(12);
    expect(a.outliers).toEqual([50]);
    expect(a.pearsonSkew).toBeGreaterThan(0);
    expect(a.dropMax.mean).toBeCloseTo(11.6, 10);
    expect(a.dropMax.median).toBe(12);
    expect(a.dropMin.median).toBe(12);
    // The median minimises the total absolute deviation.
    expect(a.sumAbsDevMedian).toBeLessThanOrEqual(a.sumAbsDevMean);
  });

  it("reports no mode when every value is unique, and odd-n median position", () => {
    const a = analyzeDataSet([7, 1, 3])!;
    expect(a.modes).toEqual([]);
    expect(a.medianPositions).toEqual([2]);
    expect(a.median).toBe(3);
  });

  it("keeps a single value stable", () => {
    const a = analyzeDataSet([5])!;
    expect(a.sampleStdDev).toBe(0);
    expect(a.dropMin).toEqual({ mean: 5, median: 5 });
    expect(a.range).toBe(0);
  });
});

describe("frequencyTable", () => {
  it("counts each distinct value in ascending order", () => {
    expect(frequencyTable([5, 5, 9, 9, 1])).toEqual([
      { value: 1, count: 1 },
      { value: 5, count: 2 },
      { value: 9, count: 2 },
    ]);
  });
});
