import { describe, it, expect } from "vitest";
import { calculateAffordableLoan } from "../AffordableLoanCalculator";
import { calculateLoan } from "../LoanCalculator";

describe("calculateAffordableLoan", () => {
  it("computes the present value of an annuity for a given payment", () => {
    // $300/month at 6% APR over 5 years -> a well-known reference max loan amount of ~$15,517.67
    const result = calculateAffordableLoan(300, 6, 5);
    expect(result.maxLoanAmount).toBeCloseTo(15517.67, 1);
  });

  it("is the exact inverse of calculateLoan", () => {
    const loan = calculateLoan(10000, 6, 5);
    const affordable = calculateAffordableLoan(loan.monthlyPayment, 6, 5);
    expect(affordable.maxLoanAmount).toBeCloseTo(10000, 0);
  });

  it("splits total payment into loan amount and interest correctly", () => {
    const result = calculateAffordableLoan(400, 7, 4);
    expect(result.totalPayment).toBeCloseTo(400 * 48, 2);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - result.maxLoanAmount, 2);
  });

  it("handles a 0% interest loan as a straight-line multiplication", () => {
    const result = calculateAffordableLoan(1000, 0, 1);
    expect(result.maxLoanAmount).toBeCloseTo(12000, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateAffordableLoan(0, 6, 5)).toEqual({
      monthlyPayment: 0,
      maxLoanAmount: 0,
      totalPayment: 0,
      totalInterest: 0,
    });
    expect(calculateAffordableLoan(-100, 6, 5).maxLoanAmount).toBe(0);
    expect(calculateAffordableLoan(300, 6, 0).maxLoanAmount).toBe(0);
    expect(calculateAffordableLoan(300, -1, 5).maxLoanAmount).toBe(0);
  });
});
