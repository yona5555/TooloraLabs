import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MortgageInput = {
  homePrice: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  extraMonthlyPayment: number;
};

export type AmortizationYear = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type AmortizationMonth = {
  /** 1-based payment number across the whole loan (1..totalPayments). */
  month: number;
  /** 1-based year this payment falls in (ceil(month / 12)). */
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type MortgageResult = MortgageInput & {
  loanAmount: number;
  downPaymentPercent: number;
  loanToValuePercent: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHOAFee: number;
  monthlyPMIFee: number;
  monthlyPayment: number;
  scheduledPayoffMonths: number;
  actualPayoffMonths: number;
  monthsSavedByExtraPayment: number;
  totalPayment: number;
  totalInterest: number;
  actualTotalInterest: number;
  interestSavedByExtraPayment: number;
  /** First month the balance reaches 80% of the original home price — the threshold at which a borrower may request PMI cancellation under the Homeowners Protection Act of 1998. Null when the loan carries no PMI. */
  pmiDropoffMonth: number | null;
  /** First month the balance reaches 78% of the original home price — the threshold at which PMI must be automatically terminated under the same law. Null when the loan carries no PMI. */
  pmiAutoTerminationMonth: number | null;
  amortizationSchedule: AmortizationYear[];
  /** The standard (no extra payment) yearly schedule, exposed alongside `amortizationSchedule` so the two can be charted side by side. Identical to `amortizationSchedule` when extraMonthlyPayment is 0. */
  standardAmortizationSchedule: AmortizationYear[];
  /** Every individual payment, month 1 through payoff — the full schedule `amortizationSchedule` aggregates into years. */
  monthlySchedule: AmortizationMonth[];
  /** The accelerated bi-weekly payment plan, computed independently of extraMonthlyPayment (an alternative payoff strategy, not stacked on top of it). */
  biweekly: BiweeklyResult;
};

type AmortizationSimulation = {
  months: number;
  totalInterest: number;
  schedule: AmortizationYear[];
  monthlySchedule: AmortizationMonth[];
  pmiDropoffMonth: number | null;
  pmiAutoTerminationMonth: number | null;
};

export type BiweeklyPayment = {
  /** 1-based payment number across the whole loan (1..payoffPeriods), each period spanning 14 days. */
  period: number;
  /** 1-based "payment year" this period falls in (ceil(period / 26)) — a run of 26 biweekly payments, not a calendar year. */
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type BiweeklyResult = {
  biweeklyPaymentAmount: number;
  payoffPeriods: number;
  /** payoffPeriods converted to a monthly-equivalent duration (periods × 12 / 26, rounded) so it can be compared against scheduledPayoffMonths. */
  payoffMonthsEquivalent: number;
  monthsSavedVsStandard: number;
  totalInterest: number;
  interestSavedVsStandard: number;
  pmiDropoffPeriod: number | null;
  pmiAutoTerminationPeriod: number | null;
  yearlySchedule: AmortizationYear[];
  schedule: BiweeklyPayment[];
};

type BiweeklySimulation = {
  periods: number;
  totalInterest: number;
  yearlySchedule: AmortizationYear[];
  schedule: BiweeklyPayment[];
  pmiDropoffPeriod: number | null;
  pmiAutoTerminationPeriod: number | null;
};

const BIWEEKLY_PERIOD_DAYS = 14;
const DAYS_PER_YEAR = 365;

/**
 * Models the standard "accelerated bi-weekly" payment plan: half the monthly P&I payment
 * collected every 14 days. 26 periods/year works out to 13 monthly-equivalent payments
 * instead of 12, so the extra principal retires the loan faster. Interest per period is
 * computed on the actual 14-day span (annual rate / 365 × 14) rather than reusing the
 * monthly periodic rate, since payments no longer land on monthly boundaries.
 */
function simulateBiweekly(
  loanAmount: number,
  annualInterestRate: number,
  monthlyPrincipalAndInterest: number,
  homePrice: number,
  hasPMI: boolean,
  capPeriods: number
): BiweeklySimulation {
  if (loanAmount <= 0 || capPeriods <= 0) {
    return {
      periods: 0,
      totalInterest: 0,
      yearlySchedule: [],
      schedule: [],
      pmiDropoffPeriod: null,
      pmiAutoTerminationPeriod: null,
    };
  }

  const biweeklyPayment = monthlyPrincipalAndInterest / 2;
  const dailyRate = annualInterestRate / 100 / DAYS_PER_YEAR;
  const ltv80Balance = homePrice * 0.8;
  const ltv78Balance = homePrice * 0.78;

  let balance = loanAmount;
  let period = 0;
  let totalInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  let pmiDropoffPeriod: number | null = null;
  let pmiAutoTerminationPeriod: number | null = null;
  const schedule: BiweeklyPayment[] = [];
  const yearlySchedule: AmortizationYear[] = [];

  while (balance > 0.005 && period < capPeriods) {
    period += 1;
    const interestPortion = balance * dailyRate * BIWEEKLY_PERIOD_DAYS;
    const principalPortion = Math.min(Math.max(biweeklyPayment - interestPortion, 0), balance);

    balance -= principalPortion;
    totalInterest += interestPortion;
    yearPrincipal += principalPortion;
    yearInterest += interestPortion;

    if (hasPMI && pmiDropoffPeriod === null && balance <= ltv80Balance) {
      pmiDropoffPeriod = period;
    }
    if (hasPMI && pmiAutoTerminationPeriod === null && balance <= ltv78Balance) {
      pmiAutoTerminationPeriod = period;
    }

    schedule.push({
      period,
      year: Math.ceil(period / 26),
      payment: Number((interestPortion + principalPortion).toFixed(2)),
      principalPaid: Number(principalPortion.toFixed(2)),
      interestPaid: Number(interestPortion.toFixed(2)),
      endingBalance: Number(Math.max(balance, 0).toFixed(2)),
    });

    if (period % 26 === 0 || balance <= 0.005) {
      yearlySchedule.push({
        year: Math.ceil(period / 26),
        principalPaid: Number(yearPrincipal.toFixed(2)),
        interestPaid: Number(yearInterest.toFixed(2)),
        endingBalance: Number(Math.max(balance, 0).toFixed(2)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return { periods: period, totalInterest, yearlySchedule, schedule, pmiDropoffPeriod, pmiAutoTerminationPeriod };
}

function simulateAmortization(
  loanAmount: number,
  monthlyRate: number,
  basePayment: number,
  extraPayment: number,
  homePrice: number,
  hasPMI: boolean,
  capMonths: number
): AmortizationSimulation {
  if (loanAmount <= 0 || capMonths <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      schedule: [],
      monthlySchedule: [],
      pmiDropoffMonth: null,
      pmiAutoTerminationMonth: null,
    };
  }

  const ltv80Balance = homePrice * 0.8;
  const ltv78Balance = homePrice * 0.78;
  const paymentPerMonth = basePayment + extraPayment;

  let balance = loanAmount;
  let month = 0;
  let totalInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  let pmiDropoffMonth: number | null = null;
  let pmiAutoTerminationMonth: number | null = null;
  const schedule: AmortizationYear[] = [];
  const monthlySchedule: AmortizationMonth[] = [];

  while (balance > 0.005 && month < capMonths) {
    month += 1;
    const interestPortion = balance * monthlyRate;
    const principalPortion = Math.min(Math.max(paymentPerMonth - interestPortion, 0), balance);

    balance -= principalPortion;
    totalInterest += interestPortion;
    yearPrincipal += principalPortion;
    yearInterest += interestPortion;

    if (hasPMI && pmiDropoffMonth === null && balance <= ltv80Balance) {
      pmiDropoffMonth = month;
    }
    if (hasPMI && pmiAutoTerminationMonth === null && balance <= ltv78Balance) {
      pmiAutoTerminationMonth = month;
    }

    monthlySchedule.push({
      month,
      year: Math.ceil(month / 12),
      payment: Number((interestPortion + principalPortion).toFixed(2)),
      principalPaid: Number(principalPortion.toFixed(2)),
      interestPaid: Number(interestPortion.toFixed(2)),
      endingBalance: Number(Math.max(balance, 0).toFixed(2)),
    });

    if (month % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: Math.ceil(month / 12),
        principalPaid: Number(yearPrincipal.toFixed(2)),
        interestPaid: Number(yearInterest.toFixed(2)),
        endingBalance: Number(Math.max(balance, 0).toFixed(2)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return { months: month, totalInterest, schedule, monthlySchedule, pmiDropoffMonth, pmiAutoTerminationMonth };
}

export class MortgageCalculator extends BaseCalculator<MortgageInput, MortgageResult> {
  metadata = {
    id: "mortgage-calculator",
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    category: "calculators",
    description:
      "Calculate monthly mortgage payments, total interest, and total repayment.",
    version: "2.0.0",
  };

  execute(
    input: MortgageInput,
    _context: ToolContext
  ): ToolResult<MortgageResult> {
    const loanAmount = Math.max(input.homePrice - input.downPayment, 0);
    const monthlyRate = input.annualInterestRate / 100 / 12;
    const numberOfPayments = Math.round(input.loanTermYears * 12);
    const extraMonthlyPayment = Math.max(input.extraMonthlyPayment, 0);
    const hasPMI = input.monthlyPMI > 0;

    const principalAndInterest =
      loanAmount <= 0
        ? 0
        : monthlyRate === 0
          ? loanAmount / numberOfPayments
          : (loanAmount *
              monthlyRate *
              Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = principalAndInterest * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    const baseline = simulateAmortization(
      loanAmount,
      monthlyRate,
      principalAndInterest,
      0,
      input.homePrice,
      hasPMI,
      numberOfPayments
    );
    const scheduleSim =
      extraMonthlyPayment > 0
        ? simulateAmortization(
            loanAmount,
            monthlyRate,
            principalAndInterest,
            extraMonthlyPayment,
            input.homePrice,
            hasPMI,
            numberOfPayments
          )
        : baseline;

    const interestSavedByExtraPayment = Math.max(baseline.totalInterest - scheduleSim.totalInterest, 0);
    const monthsSavedByExtraPayment = Math.max(baseline.months - scheduleSim.months, 0);

    const capBiweeklyPeriods = Math.ceil((numberOfPayments * 26) / 12) + 2;
    const biweeklySim = simulateBiweekly(
      loanAmount,
      input.annualInterestRate,
      principalAndInterest,
      input.homePrice,
      hasPMI,
      capBiweeklyPeriods
    );
    const payoffMonthsEquivalent = Math.round((biweeklySim.periods * 12) / 26);
    const monthsSavedVsStandard = Math.max(baseline.months - payoffMonthsEquivalent, 0);
    const interestSavedVsStandard = Math.max(baseline.totalInterest - biweeklySim.totalInterest, 0);

    const monthlyTaxes = input.annualPropertyTax / 12;
    const monthlyInsurance = input.annualHomeInsurance / 12;

    return {
      success: true,
      data: {
        ...input,
        extraMonthlyPayment,
        loanAmount,
        downPaymentPercent: input.homePrice > 0 ? Number(((input.downPayment / input.homePrice) * 100).toFixed(1)) : 0,
        loanToValuePercent: input.homePrice > 0 ? Number(((loanAmount / input.homePrice) * 100).toFixed(1)) : 0,
        monthlyPrincipalAndInterest: principalAndInterest,
        monthlyTaxes,
        monthlyInsurance,
        monthlyHOAFee: input.monthlyHOA,
        monthlyPMIFee: input.monthlyPMI,
        monthlyPayment:
          principalAndInterest +
          monthlyTaxes +
          monthlyInsurance +
          input.monthlyHOA +
          input.monthlyPMI,
        scheduledPayoffMonths: numberOfPayments,
        actualPayoffMonths: scheduleSim.months,
        monthsSavedByExtraPayment,
        totalPayment,
        totalInterest,
        actualTotalInterest: scheduleSim.totalInterest,
        interestSavedByExtraPayment,
        pmiDropoffMonth: scheduleSim.pmiDropoffMonth,
        pmiAutoTerminationMonth: scheduleSim.pmiAutoTerminationMonth,
        amortizationSchedule: scheduleSim.schedule,
        standardAmortizationSchedule: baseline.schedule,
        monthlySchedule: scheduleSim.monthlySchedule,
        biweekly: {
          biweeklyPaymentAmount: principalAndInterest / 2,
          payoffPeriods: biweeklySim.periods,
          payoffMonthsEquivalent,
          monthsSavedVsStandard,
          totalInterest: biweeklySim.totalInterest,
          interestSavedVsStandard,
          pmiDropoffPeriod: biweeklySim.pmiDropoffPeriod,
          pmiAutoTerminationPeriod: biweeklySim.pmiAutoTerminationPeriod,
          yearlySchedule: biweeklySim.yearlySchedule,
          schedule: biweeklySim.schedule,
        },
      },
      metadata: {},
    };
  }
}
