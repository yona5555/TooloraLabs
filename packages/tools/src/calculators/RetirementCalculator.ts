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
