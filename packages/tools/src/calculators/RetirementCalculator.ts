import { calculateCompoundInterest, type YearlyGrowthPoint, type MonthlyGrowthPoint } from "./CompoundInterestCalculator";
import { solveInvestmentLength, solveAdditionalContribution } from "./InvestmentGoalSolver";

export type RetirementResult = {
  projectedBalance: number;
  totalContributions: number;
  startingBalanceGrowth: number;
  totalGrowth: number;
  yearsToRetirement: number;
};

/**
 * Projects a retirement account balance from a starting balance plus
 * regular monthly contributions, both compounding monthly at a fixed
 * annual return, until the chosen retirement age — the same
 * future-value-of-an-annuity-plus-lump-sum math behind any long-term
 * savings projection, deliberately without tax treatment (401(k), IRA,
 * or otherwise), inflation adjustment, or contribution limits, none of
 * which are universal enough to assume for a general audience.
 */
export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturnRate: number
): RetirementResult {
  if (
    !Number.isFinite(currentAge) ||
    currentAge < 0 ||
    !Number.isFinite(retirementAge) ||
    retirementAge <= currentAge ||
    !Number.isFinite(currentSavings) ||
    currentSavings < 0 ||
    !Number.isFinite(monthlyContribution) ||
    monthlyContribution < 0 ||
    !Number.isFinite(annualReturnRate) ||
    annualReturnRate < 0
  ) {
    return {
      projectedBalance: 0,
      totalContributions: 0,
      startingBalanceGrowth: 0,
      totalGrowth: 0,
      yearsToRetirement: 0,
    };
  }

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = annualReturnRate / 100 / 12;
  const numberOfMonths = Math.round(yearsToRetirement * 12);

  const startingBalanceFutureValue = currentSavings * Math.pow(1 + monthlyRate, numberOfMonths);

  const contributionsFutureValue =
    monthlyRate === 0
      ? monthlyContribution * numberOfMonths
      : monthlyContribution * ((Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate);

  const projectedBalance = startingBalanceFutureValue + contributionsFutureValue;
  const totalContributions = currentSavings + monthlyContribution * numberOfMonths;
  const totalGrowth = projectedBalance - totalContributions;
  const startingBalanceGrowth = startingBalanceFutureValue - currentSavings;

  return {
    projectedBalance,
    totalContributions,
    startingBalanceGrowth,
    totalGrowth,
    yearsToRetirement,
  };
}

export type RetirementProjection = RetirementResult & {
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
};

/**
 * Same projection as `calculateRetirement`, plus the full year-by-year and month-by-month
 * growth schedule. Retirement growth is the identical future-value-of-an-annuity-plus-lump-sum
 * math Compound Interest Calculator already simulates month by month, so this is a thin wrapper
 * around `calculateCompoundInterest` (always monthly compounding, no tax or inflation
 * adjustment — this tool doesn't expose those as inputs) rather than a second simulation loop.
 */
export function calculateRetirementProjection(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturnRate: number
): RetirementProjection {
  const base = calculateRetirement(currentAge, retirementAge, currentSavings, monthlyContribution, annualReturnRate);
  if (base.yearsToRetirement <= 0) {
    return { ...base, yearlySchedule: [], monthlySchedule: [] };
  }

  const forward = calculateCompoundInterest(currentSavings, annualReturnRate, base.yearsToRetirement, "monthly", monthlyContribution);
  return { ...base, yearlySchedule: forward.yearlySchedule, monthlySchedule: forward.monthlySchedule };
}

export type RequiredContributionResult = {
  requiredMonthlyContribution: number;
  yearsToRetirement: number;
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
};

/**
 * The reverse of the contribution side of a retirement projection: given a target balance at
 * retirement, finds the required monthly contribution — reusing the same closed-form
 * contribution solver Compound Interest Calculator's "Additional Contribution" tab uses, since
 * the underlying math (future value linear in a level monthly contribution) is identical.
 */
export function solveRequiredContribution(
  targetBalance: number,
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  annualReturnRate: number
): RequiredContributionResult {
  if (!Number.isFinite(currentAge) || currentAge < 0 || !Number.isFinite(retirementAge) || retirementAge <= currentAge || !Number.isFinite(targetBalance) || targetBalance <= 0) {
    return { requiredMonthlyContribution: 0, yearsToRetirement: 0, yearlySchedule: [], monthlySchedule: [] };
  }

  const yearsToRetirement = retirementAge - currentAge;
  const requiredMonthlyContribution = solveAdditionalContribution(targetBalance, currentSavings, annualReturnRate, yearsToRetirement, "monthly");
  const forward = calculateCompoundInterest(currentSavings, annualReturnRate, yearsToRetirement, "monthly", requiredMonthlyContribution);

  return { requiredMonthlyContribution, yearsToRetirement, yearlySchedule: forward.yearlySchedule, monthlySchedule: forward.monthlySchedule };
}

export type RequiredYearsResult = {
  yearsNeeded: number | null;
  retirementAgeReached: number | null;
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
};

/**
 * The reverse of the time side of a retirement projection: given a target balance, finds how
 * many years of growth it takes to reach it — reusing the same month-by-month search Compound
 * Interest Calculator's "Investment Length" tab uses, since balance is monotonically
 * non-decreasing in time and the search is exact, not an approximation.
 */
export function solveRequiredYears(
  targetBalance: number,
  currentAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturnRate: number,
  maxYears: number
): RequiredYearsResult {
  if (!Number.isFinite(currentAge) || currentAge < 0 || !Number.isFinite(targetBalance) || targetBalance <= 0) {
    return { yearsNeeded: null, retirementAgeReached: null, yearlySchedule: [], monthlySchedule: [] };
  }

  const yearsNeeded = solveInvestmentLength(targetBalance, currentSavings, annualReturnRate, "monthly", monthlyContribution, maxYears);
  if (yearsNeeded === null) {
    return { yearsNeeded: null, retirementAgeReached: null, yearlySchedule: [], monthlySchedule: [] };
  }

  const forward = calculateCompoundInterest(currentSavings, annualReturnRate, yearsNeeded, "monthly", monthlyContribution);
  return { yearsNeeded, retirementAgeReached: currentAge + yearsNeeded, yearlySchedule: forward.yearlySchedule, monthlySchedule: forward.monthlySchedule };
}
