export type CompoundingFrequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const COMPOUNDING_PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export type YearlyGrowthPoint = {
  year: number;
  /** Cumulative balance at the start of this year (the previous year's ending balance, or the principal for year 1). */
  openingBalance: number;
  /** Cumulative contributions made from the start through the end of this year. */
  contributions: number;
  /** Cumulative interest earned from the start through the end of this year. */
  interest: number;
  /** Cumulative balance at the end of this year. */
  balance: number;
  /** Contributions made during this year only. */
  yearlyContributions: number;
  /** Interest earned during this year only (net of tax, if a tax rate was supplied). */
  yearlyInterest: number;
};

export type MonthlyGrowthPoint = {
  /** 1-indexed month count since the start of the investment. */
  month: number;
  /** Which investment year (1-indexed) this month falls within. */
  year: number;
  openingBalance: number;
  contribution: number;
  interest: number;
  balance: number;
};

export type CompoundInterestResult = {
  futureValue: number;
  principal: number;
  totalContributions: number;
  totalInterest: number;
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
  /** Future value expressed in today's purchasing power, deflated by the supplied annual inflation rate. */
  buyingPowerAfterInflation: number;
};

/**
 * Simulated month by month regardless of the chosen compounding frequency,
 * so a monthly contribution can be added every period no matter how often
 * interest itself compounds — the compounding frequency only changes the
 * *rate* applied each month (converted to its monthly-equivalent), not the
 * simulation's time step.
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  frequency: CompoundingFrequency,
  monthlyContribution = 0,
  taxRatePercent = 0,
  inflationRatePercent = 0
): CompoundInterestResult {
  if (
    !Number.isFinite(principal) ||
    principal < 0 ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(years) ||
    years <= 0
  ) {
    return {
      futureValue: 0,
      principal: 0,
      totalContributions: 0,
      totalInterest: 0,
      yearlySchedule: [],
      monthlySchedule: [],
      buyingPowerAfterInflation: 0,
    };
  }

  const periodsPerYear = COMPOUNDING_PERIODS_PER_YEAR[frequency];
  const annualRate = annualRatePercent / 100;
  const monthlyRate = annualRate === 0 ? 0 : Math.pow(1 + annualRate / periodsPerYear, periodsPerYear / 12) - 1;
  const taxRate = Math.min(Math.max(taxRatePercent, 0), 100) / 100;
  const totalMonths = Math.round(years * 12);
  const contribution = Math.max(monthlyContribution, 0);

  let balance = principal;
  let totalContributions = 0;
  let openingBalance = principal;
  let yearlyContributions = 0;
  let yearlyInterest = 0;
  const yearlySchedule: YearlyGrowthPoint[] = [];
  const monthlySchedule: MonthlyGrowthPoint[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const monthOpeningBalance = balance;
    const grossInterest = balance * monthlyRate;
    const netInterest = grossInterest * (1 - taxRate);
    balance += netInterest;
    yearlyInterest += netInterest;

    balance += contribution;
    totalContributions += contribution;
    yearlyContributions += contribution;

    monthlySchedule.push({
      month,
      year: Math.ceil(month / 12),
      openingBalance: monthOpeningBalance,
      contribution,
      interest: netInterest,
      balance,
    });

    if (month % 12 === 0 || month === totalMonths) {
      yearlySchedule.push({
        year: Math.ceil(month / 12),
        openingBalance,
        contributions: totalContributions,
        interest: balance - principal - totalContributions,
        balance,
        yearlyContributions,
        yearlyInterest,
      });
      openingBalance = balance;
      yearlyContributions = 0;
      yearlyInterest = 0;
    }
  }

  const inflationRate = Math.max(inflationRatePercent, 0) / 100;
  const buyingPowerAfterInflation = inflationRate > 0 ? balance / Math.pow(1 + inflationRate, years) : balance;

  return {
    futureValue: balance,
    principal,
    totalContributions,
    totalInterest: balance - principal - totalContributions,
    yearlySchedule,
    monthlySchedule,
    buyingPowerAfterInflation,
  };
}
