import { describe, it, expect } from "vitest";
import { MortgageCalculator } from "../MortgageCalculator";

const context = { locale: "en-US" };
const baseInput = {
  homePrice: 300000,
  downPayment: 60000,
  annualInterestRate: 6,
  loanTermYears: 30,
  annualPropertyTax: 3600,
  annualHomeInsurance: 1200,
  monthlyHOA: 50,
  monthlyPMI: 0,
  extraMonthlyPayment: 0,
};

describe("MortgageCalculator", () => {
  it("computes loan amount and monthly payment", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    expect(result.data.loanAmount).toBe(240000);
    expect(result.data.monthlyPrincipalAndInterest).toBeCloseTo(1438.92, 1);
  });

  it("includes taxes, insurance, HOA, and PMI in total monthly payment", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    const expectedMonthly =
      result.data.monthlyPrincipalAndInterest + 300 + 100 + 50 + 0;
    expect(result.data.monthlyPayment).toBeCloseTo(expectedMonthly, 1);
  });

  it("handles zero interest rate without dividing by zero", () => {
    const result = new MortgageCalculator().execute(
      { ...baseInput, annualInterestRate: 0 },
      context
    );
    expect(result.data.monthlyPrincipalAndInterest).toBeCloseTo(
      240000 / 360,
      1
    );
  });

  it("computes down payment percent and loan-to-value", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    expect(result.data.downPaymentPercent).toBeCloseTo(20, 1);
    expect(result.data.loanToValuePercent).toBeCloseTo(80, 1);
  });

  it("builds a yearly amortization schedule that fully pays off the loan", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    expect(result.data.amortizationSchedule).toHaveLength(30);
    expect(result.data.amortizationSchedule.at(-1)?.endingBalance).toBe(0);
    expect(result.data.actualPayoffMonths).toBe(360);
  });

  it("finds no PMI removal months when the loan carries no PMI", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    expect(result.data.pmiDropoffMonth).toBeNull();
    expect(result.data.pmiAutoTerminationMonth).toBeNull();
  });

  it("finds the PMI dropoff (80% LTV) and auto-termination (78% LTV) months when PMI applies", () => {
    const result = new MortgageCalculator().execute(
      { ...baseInput, downPayment: 30000, monthlyPMI: 120 },
      context
    );
    expect(result.data.pmiDropoffMonth).not.toBeNull();
    expect(result.data.pmiAutoTerminationMonth).not.toBeNull();
    expect(result.data.pmiAutoTerminationMonth! > result.data.pmiDropoffMonth!).toBe(true);
  });

  it("shortens the payoff and reduces interest when an extra monthly payment is applied", () => {
    const withExtra = new MortgageCalculator().execute(
      { ...baseInput, extraMonthlyPayment: 300 },
      context
    );
    expect(withExtra.data.actualPayoffMonths).toBeLessThan(360);
    expect(withExtra.data.monthsSavedByExtraPayment).toBeGreaterThan(0);
    expect(withExtra.data.interestSavedByExtraPayment).toBeGreaterThan(0);
    expect(withExtra.data.actualTotalInterest).toBeLessThan(withExtra.data.totalInterest);
  });

  it("reports zero savings when no extra payment is made", () => {
    const result = new MortgageCalculator().execute(baseInput, context);
    expect(result.data.monthsSavedByExtraPayment).toBe(0);
    expect(result.data.interestSavedByExtraPayment).toBe(0);
  });
});
