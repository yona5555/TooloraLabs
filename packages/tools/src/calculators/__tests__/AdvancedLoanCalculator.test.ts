import { describe, it, expect } from "vitest";
import { calculateLoan } from "../LoanCalculator";
import { calculateAmortizedLoan, calculateDeferredPaymentLoan, calculateBond } from "../AdvancedLoanCalculator";

describe("calculateAmortizedLoan", () => {
  it("matches the simple monthly-compound/monthly-pay engine when both frequencies are monthly", () => {
    const simple = calculateLoan(10000, 6, 5);
    const general = calculateAmortizedLoan(10000, 6, 5, "monthly", "monthly");
    expect(general.payment).toBeCloseTo(simple.monthlyPayment, 2);
    expect(general.numberOfPayments).toBe(60);
    expect(general.totalInterest).toBeCloseTo(simple.totalInterest, 1);
  });

  it("fully pays off the loan by the last scheduled payment", () => {
    const result = calculateAmortizedLoan(10000, 6, 5, "monthly", "weekly");
    const last = result.schedule[result.schedule.length - 1];
    expect(last.endingBalance).toBeCloseTo(0, 1);
    expect(result.schedule).toHaveLength(result.numberOfPayments);
  });

  it("produces a higher total interest when compounding is more frequent than payments", () => {
    const monthlyCompound = calculateAmortizedLoan(10000, 6, 5, "monthly", "annually");
    const annualCompound = calculateAmortizedLoan(10000, 6, 5, "annually", "annually");
    expect(monthlyCompound.totalInterest).toBeGreaterThan(annualCompound.totalInterest);
  });

  it("handles a 0% interest loan as a straight-line division", () => {
    const result = calculateAmortizedLoan(12000, 0, 1, "monthly", "monthly");
    expect(result.payment).toBeCloseTo(1000, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });

  it("returns an empty result for invalid inputs", () => {
    expect(calculateAmortizedLoan(0, 6, 5, "monthly", "monthly").schedule).toEqual([]);
    expect(calculateAmortizedLoan(10000, 6, 0, "monthly", "monthly").schedule).toEqual([]);
  });
});

describe("calculateDeferredPaymentLoan", () => {
  it("matches the standard future-value compounding formula", () => {
    // $10,000 at 6% compounded monthly for 5 years -> 10000 * (1.005)^60
    const result = calculateDeferredPaymentLoan(10000, 6, 5, "monthly");
    expect(result.amountDue).toBeCloseTo(10000 * Math.pow(1.005, 60), 2);
  });

  it("produces a schedule ending exactly at the amount due", () => {
    const result = calculateDeferredPaymentLoan(10000, 6, 5, "monthly");
    expect(result.schedule[result.schedule.length - 1].endingBalance).toBeCloseTo(result.amountDue, 2);
  });

  it("computes total interest as the growth over the loan amount", () => {
    const result = calculateDeferredPaymentLoan(10000, 6, 5, "monthly");
    expect(result.totalInterest).toBeCloseTo(result.amountDue - result.loanAmount, 6);
  });

  it("returns an empty result for invalid inputs", () => {
    expect(calculateDeferredPaymentLoan(-100, 6, 5, "monthly").schedule).toEqual([]);
    expect(calculateDeferredPaymentLoan(10000, 6, 0, "monthly").schedule).toEqual([]);
  });
});

describe("calculateBond", () => {
  it("is the exact inverse of calculateDeferredPaymentLoan", () => {
    const forward = calculateDeferredPaymentLoan(10000, 6, 5, "monthly");
    const bond = calculateBond(forward.amountDue, 6, 5, "monthly");
    expect(bond.amountReceived).toBeCloseTo(10000, 2);
  });

  it("computes total interest as the discount between amount received and due", () => {
    const bond = calculateBond(13488.5, 6, 5, "monthly");
    expect(bond.totalInterest).toBeCloseTo(bond.dueAmount - bond.amountReceived, 6);
  });

  it("returns an empty result for invalid inputs", () => {
    expect(calculateBond(0, 6, 5, "monthly").schedule).toEqual([]);
    expect(calculateBond(10000, 6, -1, "monthly").schedule).toEqual([]);
  });
});
