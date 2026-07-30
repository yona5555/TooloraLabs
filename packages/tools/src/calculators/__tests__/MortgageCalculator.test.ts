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
});
