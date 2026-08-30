import { describe, it, expect } from "vitest";
import { calculateCompoundInterest } from "../CompoundInterestCalculator";
import {
  solveInvestmentLength,
  solveReturnRate,
  solveStartingAmount,
  solveAdditionalContribution,
} from "../InvestmentGoalSolver";

describe("solveInvestmentLength", () => {
  it("recovers the years used to produce a known future value", () => {
    const forward = calculateCompoundInterest(10000, 7, 12, "monthly", 100);
    const years = solveInvestmentLength(forward.futureValue, 10000, 7, "monthly", 100);
    expect(years).not.toBeNull();
    expect(years as number).toBeCloseTo(12, 0);
  });

  it("returns 0 when the starting amount already meets the target", () => {
    expect(solveInvestmentLength(5000, 10000, 7, "monthly", 0)).toBe(0);
  });

  it("returns null when the target is unreachable within the search horizon", () => {
    expect(solveInvestmentLength(1_000_000_000, 100, 1, "monthly", 0)).toBeNull();
  });
});

describe("solveReturnRate", () => {
  it("recovers the rate used to produce a known future value", () => {
    const forward = calculateCompoundInterest(10000, 6.5, 15, "monthly", 150);
    const rate = solveReturnRate(forward.futureValue, 10000, 15, "monthly", 150);
    expect(rate).not.toBeNull();
    expect(rate as number).toBeCloseTo(6.5, 3);
  });

  it("recovers a 0% rate for pure accumulation with no growth", () => {
    const forward = calculateCompoundInterest(1000, 0, 5, "monthly", 50);
    const rate = solveReturnRate(forward.futureValue, 1000, 5, "monthly", 50);
    expect(rate as number).toBeCloseTo(0, 2);
  });

  it("returns null when years is zero or invalid", () => {
    expect(solveReturnRate(10000, 1000, 0, "monthly", 0)).toBeNull();
  });
});

describe("solveStartingAmount", () => {
  it("recovers the principal used to produce a known future value", () => {
    const forward = calculateCompoundInterest(8000, 5, 10, "quarterly", 75);
    const principal = solveStartingAmount(forward.futureValue, 5, 10, "quarterly", 75);
    expect(principal).toBeCloseTo(8000, 4);
  });

  it("clamps to 0 when contributions alone already exceed the target", () => {
    const principal = solveStartingAmount(100, 7, 20, "monthly", 500);
    expect(principal).toBe(0);
  });

  it("matches a direct forward recomputation using the solved principal", () => {
    const target = 50000;
    const principal = solveStartingAmount(target, 6, 8, "monthly", 200);
    const recomputed = calculateCompoundInterest(principal, 6, 8, "monthly", 200).futureValue;
    expect(recomputed).toBeCloseTo(target, 4);
  });
});

describe("solveAdditionalContribution", () => {
  it("recovers the monthly contribution used to produce a known future value", () => {
    const forward = calculateCompoundInterest(5000, 6, 10, "monthly", 120);
    const contribution = solveAdditionalContribution(forward.futureValue, 5000, 6, 10, "monthly");
    expect(contribution).toBeCloseTo(120, 4);
  });

  it("clamps to 0 when the principal alone already exceeds the target", () => {
    const contribution = solveAdditionalContribution(1000, 50000, 7, 20, "monthly");
    expect(contribution).toBe(0);
  });

  it("matches a direct forward recomputation using the solved contribution", () => {
    const target = 30000;
    const contribution = solveAdditionalContribution(target, 5000, 5, 12, "annually");
    const recomputed = calculateCompoundInterest(5000, 5, 12, "annually", contribution).futureValue;
    expect(recomputed).toBeCloseTo(target, 4);
  });
});
