import { COMPOUNDING_PERIODS_PER_YEAR, type CompoundingFrequency } from "./CompoundInterestCalculator";

export type PaymentFrequency = "annually" | "semiannually" | "quarterly" | "monthly" | "biweekly" | "weekly";

export const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

/** Consumer loans rarely run longer than this; also bounds worst-case schedule length (50 years x 52 weekly payments = 2,600 rows). */
export const MAX_LOAN_TERM_YEARS = 50;

export type LoanPaymentRow = {
  period: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
};

export type AmortizedLoanResult = {
  loanAmount: number;
  payment: number;
  paymentsPerYear: number;
  numberOfPayments: number;
  totalPayments: number;
  totalInterest: number;
  schedule: LoanPaymentRow[];
};

/**
 * The general fixed-payment amortization case, where the compounding frequency and the
 * payment frequency can differ (e.g. interest compounds monthly but payments are made
 * weekly) — unlike `calculateLoan`, which assumes both are the same (monthly). The nominal
 * annual rate is first converted to its true per-payment-period rate via the effective
 * annual rate, so periods compound correctly regardless of how the two frequencies relate.
 */
export function calculateAmortizedLoan(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
  compoundFrequency: CompoundingFrequency,
  paymentFrequency: PaymentFrequency
): AmortizedLoanResult {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !Number.isFinite(annualRatePercent) || !Number.isFinite(termYears) || termYears <= 0) {
    return { loanAmount: 0, payment: 0, paymentsPerYear: PAYMENTS_PER_YEAR[paymentFrequency], numberOfPayments: 0, totalPayments: 0, totalInterest: 0, schedule: [] };
  }

  const compoundsPerYear = COMPOUNDING_PERIODS_PER_YEAR[compoundFrequency];
  const paymentsPerYear = PAYMENTS_PER_YEAR[paymentFrequency];
  const annualRate = annualRatePercent / 100;

  const effectiveAnnualRate = annualRate === 0 ? 0 : Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear) - 1;
  const periodRate = effectiveAnnualRate === 0 ? 0 : Math.pow(1 + effectiveAnnualRate, 1 / paymentsPerYear) - 1;

  const numberOfPayments = Math.round(termYears * paymentsPerYear);

  const payment =
    periodRate === 0
      ? loanAmount / numberOfPayments
      : (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) / (Math.pow(1 + periodRate, numberOfPayments) - 1);

  let balance = loanAmount;
  let totalInterest = 0;
  const schedule: LoanPaymentRow[] = [];

  for (let period = 1; period <= numberOfPayments && balance > 0.005; period++) {
    const interestPortion = balance * periodRate;
    const principalPortion = Math.min(Math.max(payment - interestPortion, 0), balance);

    balance -= principalPortion;
    totalInterest += interestPortion;

    schedule.push({
      period,
      interestPaid: Number(interestPortion.toFixed(2)),
      principalPaid: Number(principalPortion.toFixed(2)),
      endingBalance: Number(Math.max(balance, 0).toFixed(2)),
    });
  }

  return {
    loanAmount,
    payment,
    paymentsPerYear,
    numberOfPayments,
    totalPayments: payment * numberOfPayments,
    totalInterest,
    schedule,
  };
}

export type LoanGrowthRow = {
  year: number;
  interestAccrued: number;
  endingBalance: number;
};

export type DeferredPaymentLoanResult = {
  loanAmount: number;
  amountDue: number;
  totalInterest: number;
  schedule: LoanGrowthRow[];
};

/**
 * A single lump sum, borrowed now and repaid in one balloon payment at maturity — interest
 * compounds throughout the term with no periodic payments in between. The reported schedule
 * is annual (rather than per compounding period) purely for a readable year-by-year growth
 * view; the actual future-value math still uses the true per-compounding-period rate.
 */
export function calculateDeferredPaymentLoan(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
  compoundFrequency: CompoundingFrequency
): DeferredPaymentLoanResult {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !Number.isFinite(annualRatePercent) || !Number.isFinite(termYears) || termYears <= 0) {
    return { loanAmount: 0, amountDue: 0, totalInterest: 0, schedule: [] };
  }

  const compoundsPerYear = COMPOUNDING_PERIODS_PER_YEAR[compoundFrequency];
  const annualRate = annualRatePercent / 100;
  const growthPerYear = annualRate === 0 ? 1 : Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear);

  const wholeYears = Math.floor(termYears);
  const schedule: LoanGrowthRow[] = [];
  let balance = loanAmount;

  for (let year = 1; year <= wholeYears; year++) {
    const newBalance = balance * growthPerYear;
    schedule.push({ year, interestAccrued: Number((newBalance - balance).toFixed(2)), endingBalance: Number(newBalance.toFixed(2)) });
    balance = newBalance;
  }

  const fractionalYear = termYears - wholeYears;
  if (fractionalYear > 0.001) {
    const newBalance = balance * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * fractionalYear);
    schedule.push({ year: termYears, interestAccrued: Number((newBalance - balance).toFixed(2)), endingBalance: Number(newBalance.toFixed(2)) });
    balance = newBalance;
  }

  return {
    loanAmount,
    amountDue: balance,
    totalInterest: balance - loanAmount,
    schedule,
  };
}

export type BondResult = {
  amountReceived: number;
  dueAmount: number;
  totalInterest: number;
  schedule: LoanGrowthRow[];
};

/**
 * The mirror image of a deferred-payment loan: the amount due at maturity is given, and the
 * amount received today is the present value that would grow to it. Reuses the same forward
 * growth engine — computing it from the discounted starting amount reproduces the exact
 * target at maturity, so the schedule always lands precisely on the due amount.
 */
export function calculateBond(dueAmount: number, annualRatePercent: number, termYears: number, compoundFrequency: CompoundingFrequency): BondResult {
  if (!Number.isFinite(dueAmount) || dueAmount <= 0 || !Number.isFinite(annualRatePercent) || !Number.isFinite(termYears) || termYears <= 0) {
    return { amountReceived: 0, dueAmount: 0, totalInterest: 0, schedule: [] };
  }

  const compoundsPerYear = COMPOUNDING_PERIODS_PER_YEAR[compoundFrequency];
  const annualRate = annualRatePercent / 100;
  const growthFactor = annualRate === 0 ? 1 : Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * termYears);
  const amountReceived = dueAmount / growthFactor;

  const forward = calculateDeferredPaymentLoan(amountReceived, annualRatePercent, termYears, compoundFrequency);

  return {
    amountReceived,
    dueAmount,
    totalInterest: dueAmount - amountReceived,
    schedule: forward.schedule,
  };
}
