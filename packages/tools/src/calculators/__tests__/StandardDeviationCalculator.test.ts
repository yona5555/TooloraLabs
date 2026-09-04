import { describe, it, expect } from "vitest";
import { StandardDeviationCalculator } from "../StandardDeviationCalculator";

const context = { locale: "en-US" };
const calc = new StandardDeviationCalculator();

describe("StandardDeviationCalculator", () => {
  it("computes mean, population, and sample statistics for a known data set", () => {
    // Classic textbook set: 2, 4, 4, 4, 5, 5, 7, 9 -> mean 5, population stdDev 2, sample stdDev ~2.138
    const r = calc.execute({ values: [2, 4, 4, 4, 5, 5, 7, 9] }, context);
    expect(r.data.mean).toBeCloseTo(5, 10);
    expect(r.data.populationVariance).toBeCloseTo(4, 10);
    expect(r.data.populationStdDev).toBeCloseTo(2, 10);
    expect(r.data.sampleVariance).toBeCloseTo(32 / 7, 10);
    expect(r.data.sampleStdDev).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it("returns a deviations row per value with correct squared deviations", () => {
    const r = calc.execute({ values: [1, 2, 3] }, context);
    expect(r.data.mean).toBe(2);
    expect(r.data.deviations).toEqual([
      { value: 1, deviation: -1, squaredDeviation: 1 },
      { value: 2, deviation: 0, squaredDeviation: 0 },
      { value: 3, deviation: 1, squaredDeviation: 1 },
    ]);
    expect(r.data.sumOfSquaredDeviations).toBe(2);
  });

  it("returns zero standard deviation for identical values", () => {
    const r = calc.execute({ values: [7, 7, 7, 7] }, context);
    expect(r.data.populationStdDev).toBe(0);
    expect(r.data.sampleStdDev).toBe(0);
  });

  it("leaves sample variance/stdDev at zero for a single value, since n-1 would divide by zero", () => {
    const r = calc.execute({ values: [42] }, context);
    expect(r.data.mean).toBe(42);
    expect(r.data.populationStdDev).toBe(0);
    expect(r.data.sampleVariance).toBe(0);
    expect(r.data.sampleStdDev).toBe(0);
  });

  it("flags an empty data set as an error", () => {
    const r = calc.execute({ values: [] }, context);
    expect(r.data.error).toBe("empty-dataset");
    expect(r.data.count).toBe(0);
  });
});
