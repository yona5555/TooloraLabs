import type { MonthlyGrowthPoint, YearlyGrowthPoint } from "@tooloralabs/tools";

export type RetirementMode = "endAmount" | "requiredContribution" | "requiredYears";

export const RETIREMENT_MODES: RetirementMode[] = ["endAmount", "requiredContribution", "requiredYears"];

/**
 * Normalized shape all three modes resolve into, so downstream UI (result card, chart, table)
 * doesn't need to branch on mode to know what to render. `totalContributionsPure` deliberately
 * excludes `currentSavings` (unlike the engine's own `RetirementResult.totalContributions`,
 * which bakes it in) so callers can add it back exactly once wherever it's needed.
 */
export type RetirementOutcome = {
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
  projectedBalance: number;
  totalContributionsPure: number;
  totalGrowth: number;
  yearsToRetirement: number;
  requiredMonthlyContribution: number;
  retirementAgeReached: number | null;
  unreachable: boolean;
  /**
   * `projectedBalance` deflated by the "Projected Balance" tab's optional inflation-rate input,
   * expressed in today's purchasing power — equal to `projectedBalance` itself whenever inflation
   * isn't set (rate 0) or on the two reverse-solve tabs, where this feature isn't offered.
   */
  inflationAdjustedBalance: number;
};
