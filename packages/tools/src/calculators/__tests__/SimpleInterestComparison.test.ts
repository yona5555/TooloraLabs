import { describe, it, expect } from "vitest";
import { calculateCompoundInterest } from "../CompoundInterestCalculator";
import { calculateSimpleInterestSchedule } from "../SimpleInterestComparison";

describe("calculateSimpleInterestSchedule", () => {
  it("returns one point per year, aligned with the compound schedule's year numbers", () => {
    const compound = calculateCompoundInterest(10000, 7, 10, "monthly", 100);
    const simple = calculateSimpleInterestSchedule(10000, 7, 10, 100);
    expect(simple.map((row) => row.year)).toEqual(compound.yearlySchedule.map((row) => row.year));
  });

  it("grows linearly with no compounding when there are no contributions", () => {
    const simple = calculateSimpleInterestSchedule(10000, 10, 5, 0);
    const interestPerYear = simple[0].interest;
    for (let i = 1; i < simple.length; i++) {
      expect(simple[i].interest - simple[i - 1].interest).toBeCloseTo(interestPerYear, 2);
    }
  });

  it("produces a lower final balance than compound interest for the same inputs when rate > 0", () => {
    const compound = calculateCompoundInterest(10000, 7, 10, "monthly", 100);
    const simple = calculateSimpleInterestSchedule(10000, 7, 10, 100);
    expect(simple[simple.length - 1].balance).toBeLessThan(compound.futureValue);
  });

  it("matches compound interest exactly when the rate is 0", () => {
    const compound = calculateCompoundInterest(10000, 0, 5, "monthly", 100);
    const simple = calculateSimpleInterestSchedule(10000, 0, 5, 100);
    expect(simple[simple.length - 1].balance).toBeCloseTo(compound.futureValue, 6);
  });

  it("applies the tax rate to accrued interest the same way the compound calculator does", () => {
    const withoutTax = calculateSimpleInterestSchedule(10000, 8, 5, 0, 0);
    const withTax = calculateSimpleInterestSchedule(10000, 8, 5, 0, 25);
    const finalInterestWithoutTax = withoutTax[withoutTax.length - 1].interest;
    const finalInterestWithTax = withTax[withTax.length - 1].interest;
    expect(finalInterestWithTax).toBeCloseTo(finalInterestWithoutTax * 0.75, 2);
  });

  it("returns an empty schedule for invalid inputs", () => {
    expect(calculateSimpleInterestSchedule(-100, 5, 10, 0)).toEqual([]);
    expect(calculateSimpleInterestSchedule(1000, 5, 0, 0)).toEqual([]);
    expect(calculateSimpleInterestSchedule(1000, 5, NaN, 0)).toEqual([]);
  });
});
