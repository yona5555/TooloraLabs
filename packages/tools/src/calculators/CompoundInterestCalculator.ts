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
  contributions: number;
  interest: number;
  balance: number;
};

export type CompoundInterestResult = {
  futureValue: number;
  principal: number;
  totalContributions: number;
  totalInterest: number;
  yearlySchedule: YearlyGrowthPoint[];
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
  monthlyContribution = 0
): CompoundInterestResult {
  if (
    !Number.isFinite(principal) ||
    principal < 0 ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(years) ||
    years <= 0
  ) {
    return { futureValue: 0, principal: 0, totalContributions: 0, totalInterest: 0, yearlySchedule: [] };
  }

  const periodsPerYear = COMPOUNDING_PERIODS_PER_YEAR[frequency];
  const annualRate = annualRatePercent / 100;
  const monthlyRate = annualRate === 0 ? 0 : Math.pow(1 + annualRate / periodsPerYear, periodsPerYear / 12) - 1;
  const totalMonths = Math.round(years * 12);
  const contribution = Math.max(monthlyContribution, 0);

  let balance = principal;
  let totalContributions = 0;
  const yearlySchedule: YearlyGrowthPoint[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    balance += balance * monthlyRate;
    balance += contribution;
    totalContributions += contribution;

    if (month % 12 === 0 || month === totalMonths) {
      yearlySchedule.push({
        year: Math.ceil(month / 12),
        contributions: totalContributions,
        interest: balance - principal - totalContributions,
        balance,
      });
    }
  }

  return {
    futureValue: balance,
    principal,
    totalContributions,
    totalInterest: balance - principal - totalContributions,
    yearlySchedule,
  };
}
