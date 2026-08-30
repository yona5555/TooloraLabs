export type SimpleInterestYearlyPoint = {
  year: number;
  /** Cumulative balance at the end of this year. */
  balance: number;
  /** Cumulative contributions made from the start through the end of this year. */
  contributions: number;
  /** Cumulative interest earned from the start through the end of this year. */
  interest: number;
};

/**
 * Simple (non-compounding) interest, simulated on the same month-by-month
 * timeline as `calculateCompoundInterest` so the two schedules line up
 * year-for-year in a comparison chart. Each month's interest is a flat
 * percentage of the capital currently invested (principal plus contributions
 * so far) — unlike compound interest, that interest is never added back into
 * the base future interest is calculated from.
 */
export function calculateSimpleInterestSchedule(
  principal: number,
  annualRatePercent: number,
  years: number,
  monthlyContribution = 0,
  taxRatePercent = 0
): SimpleInterestYearlyPoint[] {
  if (
    !Number.isFinite(principal) ||
    principal < 0 ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(years) ||
    years <= 0
  ) {
    return [];
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const taxRate = Math.min(Math.max(taxRatePercent, 0), 100) / 100;
  const contribution = Math.max(monthlyContribution, 0);
  const totalMonths = Math.round(years * 12);

  let capitalBase = principal;
  let interestAccrued = 0;
  let totalContributions = 0;
  const schedule: SimpleInterestYearlyPoint[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const grossInterest = capitalBase * monthlyRate;
    interestAccrued += grossInterest * (1 - taxRate);

    capitalBase += contribution;
    totalContributions += contribution;

    if (month % 12 === 0 || month === totalMonths) {
      schedule.push({
        year: Math.ceil(month / 12),
        balance: principal + totalContributions + interestAccrued,
        contributions: totalContributions,
        interest: interestAccrued,
      });
    }
  }

  return schedule;
}
