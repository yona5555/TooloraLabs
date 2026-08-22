import { describe, it, expect } from "vitest";
import { calculateRetirement } from "../RetirementCalculator";

describe("calculateRetirement", () => {
  it("projects a balance from a starting amount plus contributions", () => {
    // Age 30 -> 65, $10,000 start, $500/month, 7% annual return
    const result = calculateRetirement(30, 65, 10000, 500, 7);
    expect(result.projectedBalance).toBeCloseTo(1015588.82, 1);
    expect(result.yearsToRetirement).toBe(35);
  });

  it("projects a balance from contributions alone with no starting amount", () => {
    const result = calculateRetirement(25, 65, 0, 300, 6);
    expect(result.projectedBalance).toBeCloseTo(597447.22, 1);
  });

  it("splits the projected balance into contributions and growth correctly", () => {
    const result = calculateRetirement(30, 65, 10000, 500, 7);
    expect(result.totalContributions).toBeCloseTo(10000 + 500 * 12 * 35, 2);
    expect(result.totalGrowth).toBeCloseTo(result.projectedBalance - result.totalContributions, 2);
  });

  it("handles a 0% return rate as simple, growth-free accumulation", () => {
    const result = calculateRetirement(40, 50, 5000, 200, 0);
    expect(result.projectedBalance).toBeCloseTo(5000 + 200 * 120, 5);
    expect(result.totalGrowth).toBeCloseTo(0, 5);
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateRetirement(30, 65, 10000, 500, 7).projectedBalance).toBeGreaterThan(0);
    expect(calculateRetirement(65, 65, 10000, 500, 7)).toEqual({
      projectedBalance: 0,
      totalContributions: 0,
      startingBalanceGrowth: 0,
      totalGrowth: 0,
      yearsToRetirement: 0,
    });
    expect(calculateRetirement(65, 60, 10000, 500, 7).projectedBalance).toBe(0);
    expect(calculateRetirement(-5, 65, 10000, 500, 7).projectedBalance).toBe(0);
    expect(calculateRetirement(30, 65, -100, 500, 7).projectedBalance).toBe(0);
    expect(calculateRetirement(30, 65, 10000, -50, 7).projectedBalance).toBe(0);
    expect(calculateRetirement(30, 65, 10000, 500, -1).projectedBalance).toBe(0);
  });
});
