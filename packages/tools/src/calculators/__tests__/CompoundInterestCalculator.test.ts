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
      monthlySchedule: [],
      buyingPowerAfterInflation: 0,
    });
    expect(calculateCompoundInterest(1000, 5, 0, "monthly")).toEqual({
      futureValue: 0,
      principal: 0,
      totalContributions: 0,
      totalInterest: 0,
      yearlySchedule: [],
      monthlySchedule: [],
      buyingPowerAfterInflation: 0,
    });
  });

  it("treats a 0% rate as pure accumulation of principal and contributions", () => {
    const result = calculateCompoundInterest(1000, 0, 1, "monthly", 100);
    expect(result.futureValue).toBeCloseTo(1000 + 1200, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });

  it("tracks opening balance and per-year deltas in the yearly schedule", () => {
    const result = calculateCompoundInterest(1000, 12, 2, "monthly", 100);
    expect(result.yearlySchedule[0].openingBalance).toBe(1000);
    expect(result.yearlySchedule[1].openingBalance).toBeCloseTo(result.yearlySchedule[0].balance, 5);
    const totalYearlyContributions = result.yearlySchedule.reduce((sum, row) => sum + row.yearlyContributions, 0);
    const totalYearlyInterest = result.yearlySchedule.reduce((sum, row) => sum + row.yearlyInterest, 0);
    expect(totalYearlyContributions).toBeCloseTo(result.totalContributions, 5);
    expect(totalYearlyInterest).toBeCloseTo(result.totalInterest, 5);
  });

  it("reduces growth when a tax rate on interest is supplied", () => {
    const untaxed = calculateCompoundInterest(1000, 10, 5, "monthly", 0, 0);
    const taxed = calculateCompoundInterest(1000, 10, 5, "monthly", 0, 25);
    expect(taxed.futureValue).toBeLessThan(untaxed.futureValue);
    expect(taxed.totalInterest).toBeGreaterThan(0);
  });

  it("builds a monthly schedule that reconciles with the yearly schedule", () => {
    const result = calculateCompoundInterest(1000, 6, 2, "monthly", 50);
    expect(result.monthlySchedule).toHaveLength(24);
    expect(result.monthlySchedule[0].openingBalance).toBe(1000);
    expect(result.monthlySchedule[23].balance).toBeCloseTo(result.futureValue, 5);
    const year1Interest = result.monthlySchedule
      .filter((row) => row.year === 1)
      .reduce((sum, row) => sum + row.interest, 0);
    expect(year1Interest).toBeCloseTo(result.yearlySchedule[0].yearlyInterest, 5);
  });

  it("leaves the nominal future value unaffected by inflation but deflates buying power", () => {
    const noInflation = calculateCompoundInterest(1000, 7, 10, "monthly", 0, 0, 0);
    const withInflation = calculateCompoundInterest(1000, 7, 10, "monthly", 0, 0, 3);
    expect(withInflation.futureValue).toBeCloseTo(noInflation.futureValue, 5);
    expect(withInflation.buyingPowerAfterInflation).toBeLessThan(withInflation.futureValue);
    expect(withInflation.buyingPowerAfterInflation).toBeCloseTo(withInflation.futureValue / Math.pow(1.03, 10), 5);
  });
});
