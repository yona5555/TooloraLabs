import { describe, it, expect } from "vitest";
import { calculateLoan } from "../LoanCalculator";

describe("calculateLoan", () => {
  it("matches the standard amortizing-payment formula", () => {
    // $10,000 at 6% APR over 5 years -> a well-known reference payment of ~$193.33/month
    const result = calculateLoan(10000, 6, 5);
    expect(result.monthlyPayment).toBeCloseTo(193.33, 1);
  });

  it("fully pays off the loan by the end of the term", () => {
    const result = calculateLoan(10000, 6, 5);
    const lastMonth = result.monthlySchedule[result.monthlySchedule.length - 1];
    expect(lastMonth.endingBalance).toBeCloseTo(0, 1);
    expect(result.monthlySchedule).toHaveLength(60);
  });

  it("splits total payment into principal and interest correctly", () => {
    const result = calculateLoan(10000, 6, 5);
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 60, 2);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - result.loanAmount, 2);
  });

  it("handles a 0% interest loan as a straight-line division", () => {
    const result = calculateLoan(12000, 0, 1);
    expect(result.monthlyPayment).toBeCloseTo(1000, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });

  it("builds a yearly amortization schedule", () => {
    const result = calculateLoan(20000, 7, 3);
    expect(result.amortizationSchedule).toHaveLength(3);
    expect(result.amortizationSchedule[2].endingBalance).toBeCloseTo(0, 1);
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateLoan(0, 6, 5)).toEqual({
      loanAmount: 0,
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      amortizationSchedule: [],
      monthlySchedule: [],
    });
    expect(calculateLoan(-100, 6, 5).loanAmount).toBe(0);
    expect(calculateLoan(10000, 6, 0).loanAmount).toBe(0);
  });
});
