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

  describe("monthlySchedule", () => {
    it("has one row per payment, correctly numbered and grouped by year", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      expect(result.data.monthlySchedule).toHaveLength(360);
      expect(result.data.monthlySchedule[0].month).toBe(1);
      expect(result.data.monthlySchedule[0].year).toBe(1);
      expect(result.data.monthlySchedule[11].year).toBe(1);
      expect(result.data.monthlySchedule[12].year).toBe(2);
      expect(result.data.monthlySchedule.at(-1)?.month).toBe(360);
      expect(result.data.monthlySchedule.at(-1)?.year).toBe(30);
    });

    it("ends with a zero balance and each month's payment splitting into principal + interest", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      expect(result.data.monthlySchedule.at(-1)?.endingBalance).toBe(0);

      const first = result.data.monthlySchedule[0];
      expect(first.principalPaid + first.interestPaid).toBeCloseTo(first.payment, 2);
      expect(first.interestPaid).toBeGreaterThan(first.principalPaid);
    });

    it("aggregates back into the yearly amortizationSchedule", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      const year1Months = result.data.monthlySchedule.filter((m) => m.year === 1);
      const year1PrincipalSum = year1Months.reduce((sum, m) => sum + m.principalPaid, 0);
      const year1InterestSum = year1Months.reduce((sum, m) => sum + m.interestPaid, 0);

      expect(year1Months).toHaveLength(12);
      expect(year1PrincipalSum).toBeCloseTo(result.data.amortizationSchedule[0].principalPaid, 1);
      expect(year1InterestSum).toBeCloseTo(result.data.amortizationSchedule[0].interestPaid, 1);
    });

    it("shortens the monthly schedule when an extra payment is applied", () => {
      const withExtra = new MortgageCalculator().execute(
        { ...baseInput, extraMonthlyPayment: 300 },
        context
      );
      expect(withExtra.data.monthlySchedule.length).toBeLessThan(360);
      expect(withExtra.data.monthlySchedule.at(-1)?.endingBalance).toBe(0);
    });

    it("returns an empty monthly schedule when there is no loan balance", () => {
      const result = new MortgageCalculator().execute(
        { ...baseInput, homePrice: 100000, downPayment: 100000 },
        context
      );
      expect(result.data.monthlySchedule).toHaveLength(0);
    });
  });

  describe("biweekly", () => {
    it("sets the bi-weekly payment to half the monthly principal and interest", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      expect(result.data.biweekly.biweeklyPaymentAmount).toBeCloseTo(
        result.data.monthlyPrincipalAndInterest / 2,
        6
      );
    });

    it("pays off faster and cheaper than the standard monthly schedule", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      expect(result.data.biweekly.payoffMonthsEquivalent).toBeLessThan(result.data.scheduledPayoffMonths);
      expect(result.data.biweekly.monthsSavedVsStandard).toBeGreaterThan(0);
      expect(result.data.biweekly.totalInterest).toBeLessThan(result.data.totalInterest);
      expect(result.data.biweekly.interestSavedVsStandard).toBeGreaterThan(0);
    });

    it("builds a full bi-weekly schedule that ends with a zero balance", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      const { schedule, payoffPeriods } = result.data.biweekly;
      expect(schedule).toHaveLength(payoffPeriods);
      expect(schedule.at(-1)?.endingBalance).toBe(0);
      expect(schedule[0].period).toBe(1);

      const first = schedule[0];
      expect(first.principalPaid + first.interestPaid).toBeCloseTo(first.payment, 2);
    });

    it("groups the bi-weekly schedule into 26-payment years that sum back to the totals", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      const { schedule, yearlySchedule } = result.data.biweekly;

      const year1Periods = schedule.filter((p) => p.year === 1);
      const year1PrincipalSum = year1Periods.reduce((sum, p) => sum + p.principalPaid, 0);
      const year1InterestSum = year1Periods.reduce((sum, p) => sum + p.interestPaid, 0);

      expect(year1Periods).toHaveLength(26);
      expect(year1PrincipalSum).toBeCloseTo(yearlySchedule[0].principalPaid, 1);
      expect(year1InterestSum).toBeCloseTo(yearlySchedule[0].interestPaid, 1);
    });

    it("finds no PMI removal periods when the loan carries no PMI", () => {
      const result = new MortgageCalculator().execute(baseInput, context);
      expect(result.data.biweekly.pmiDropoffPeriod).toBeNull();
      expect(result.data.biweekly.pmiAutoTerminationPeriod).toBeNull();
    });

    it("finds the PMI dropoff and auto-termination periods when PMI applies, in order", () => {
      const result = new MortgageCalculator().execute(
        { ...baseInput, downPayment: 30000, monthlyPMI: 120 },
        context
      );
      const { pmiDropoffPeriod, pmiAutoTerminationPeriod } = result.data.biweekly;
      expect(pmiDropoffPeriod).not.toBeNull();
      expect(pmiAutoTerminationPeriod).not.toBeNull();
      expect(pmiAutoTerminationPeriod! > pmiDropoffPeriod!).toBe(true);
    });

    it("stays unaffected by extraMonthlyPayment, since it is an alternative payoff strategy", () => {
      const withoutExtra = new MortgageCalculator().execute(baseInput, context);
      const withExtra = new MortgageCalculator().execute(
        { ...baseInput, extraMonthlyPayment: 300 },
        context
      );
      expect(withExtra.data.biweekly.payoffPeriods).toBe(withoutExtra.data.biweekly.payoffPeriods);
      expect(withExtra.data.biweekly.totalInterest).toBeCloseTo(withoutExtra.data.biweekly.totalInterest, 2);
    });

    it("returns an empty schedule and zero payment when there is no loan balance", () => {
      const result = new MortgageCalculator().execute(
        { ...baseInput, homePrice: 100000, downPayment: 100000 },
        context
      );
      expect(result.data.biweekly.biweeklyPaymentAmount).toBe(0);
      expect(result.data.biweekly.schedule).toHaveLength(0);
      expect(result.data.biweekly.payoffPeriods).toBe(0);
    });
  });
});
