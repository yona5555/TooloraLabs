import { describe, it, expect } from "vitest";
import { calculateRetirement, calculateRetirementProjection, solveRequiredContribution, solveRequiredYears } from "../RetirementCalculator";

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

describe("calculateRetirementProjection", () => {
  it("matches calculateRetirement's headline numbers and adds a yearly schedule", () => {
    const base = calculateRetirement(30, 65, 10000, 500, 7);
    const projection = calculateRetirementProjection(30, 65, 10000, 500, 7);
    expect(projection.projectedBalance).toBeCloseTo(base.projectedBalance, 2);
    expect(projection.yearlySchedule).toHaveLength(35);
    expect(projection.yearlySchedule[34].balance).toBeCloseTo(base.projectedBalance, 1);
  });
});

describe("solveRequiredContribution", () => {
  it("is the exact inverse of calculateRetirementProjection's contribution side", () => {
    const forward = calculateRetirementProjection(30, 65, 10000, 500, 7);
    const reverse = solveRequiredContribution(forward.projectedBalance, 30, 65, 10000, 7);
    expect(reverse.requiredMonthlyContribution).toBeCloseTo(500, 0);
  });

  it("returns zeros for invalid inputs", () => {
    expect(solveRequiredContribution(0, 30, 65, 10000, 7).requiredMonthlyContribution).toBe(0);
    expect(solveRequiredContribution(1000000, 65, 60, 10000, 7).requiredMonthlyContribution).toBe(0);
  });
});

describe("solveRequiredYears", () => {
  it("is the exact inverse of calculateRetirementProjection's time side", () => {
    const forward = calculateRetirementProjection(30, 65, 10000, 500, 7);
    const reverse = solveRequiredYears(forward.projectedBalance, 30, 10000, 500, 7, 100);
    expect(reverse.yearsNeeded).toBeCloseTo(35, 0);
    expect(reverse.retirementAgeReached).toBeCloseTo(65, 0);
  });

  it("returns nulls when the target is unreachable within maxYears", () => {
    const reverse = solveRequiredYears(10000000, 30, 0, 10, 1, 10);
    expect(reverse.yearsNeeded).toBeNull();
    expect(reverse.retirementAgeReached).toBeNull();
  });
});
