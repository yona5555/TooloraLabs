import { ResultLevel } from "../types";
import { MortgageCalculationResult } from "../types/mortgage";

export function mapMortgageToResultLevel(
  result: MortgageCalculationResult
): ResultLevel {
  const interestRatio =
    (result.totalInterest / result.loanAmount) * 100;

  if (interestRatio <= 30) {
    return "excellent";
  }

  if (interestRatio <= 60) {
    return "good";
  }

  if (interestRatio <= 100) {
    return "normal";
  }

  if (interestRatio <= 180) {
    return "warning";
  }

  if (interestRatio <= 250) {
    return "high";
  }

  return "critical";
}
