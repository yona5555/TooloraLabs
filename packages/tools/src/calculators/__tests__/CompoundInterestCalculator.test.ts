import { describe, it, expect } from "vitest";
import { calculateCompoundInterest } from "../CompoundInterestCalculator";

describe("calculateCompoundInterest", () => {
  it("matches the standard monthly-compounding formula with no contributions", () => {
    // A = 1000 * (1 + 0.12/12)^12 = 1000 * 1.01^12 ≈ 1126.83
    const result = calculateCompoundInterest(1000, 12, 1, "monthly", 0);
    expect(result.futureValue).toBeCloseTo(1126.83, 1);
    expect(result.totalContributions).toBe(0);
    expect(result.principal).toBe(1000);
  });

  it("reduces to the annual rate exactly after 1 year when compounding annually", () => {
    // however finely simulated month by month, 1 year at an annual rate compounded annually is principal * (1 + rate)
    const result = calculateCompoundInterest(1000, 12, 1, "annually", 0);
    expect(result.futureValue).toBeCloseTo(1120, 1);
  });

  it("accumulates monthly contributions on top of growth", () => {
    const withContribution = calculateCompoundInterest(1000, 12, 1, "monthly", 100);
    const withoutContribution = calculateCompoundInterest(1000, 12, 1, "monthly", 0);
    expect(withContribution.totalContributions).toBeCloseTo(1200, 5);
    expect(withContribution.futureValue).toBeGreaterThan(withoutContribution.futureValue + 1200);
  });

  it("builds a yearly schedule with one entry per year", () => {
    const result = calculateCompoundInterest(1000, 5, 3, "monthly", 50);
    expect(result.yearlySchedule).toHaveLength(3);
    expect(result.yearlySchedule[2].year).toBe(3);
    expect(result.yearlySchedule[2].balance).toBeCloseTo(result.futureValue, 5);
  });

  it("computes total interest as the residual after principal and contributions", () => {
    const result = calculateCompoundInterest(1000, 8, 2, "quarterly", 20);
    expect(result.totalInterest).toBeCloseTo(result.futureValue - result.principal - result.totalContributions, 5);
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateCompoundInterest(-1, 5, 1, "monthly")).toEqual({
      futureValue: 0,
      principal: 0,
      totalContributions: 0,
      totalInterest: 0,
      yearlySchedule: [],
    });
    expect(calculateCompoundInterest(1000, 5, 0, "monthly")).toEqual({
      futureValue: 0,
      principal: 0,
      totalContributions: 0,
      totalInterest: 0,
      yearlySchedule: [],
    });
  });

  it("treats a 0% rate as pure accumulation of principal and contributions", () => {
    const result = calculateCompoundInterest(1000, 0, 1, "monthly", 100);
    expect(result.futureValue).toBeCloseTo(1000 + 1200, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });
});
