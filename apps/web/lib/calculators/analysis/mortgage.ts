import { MortgageCalculationResult } from "../types/mortgage";
import { ResultLevel } from "../types";

export interface MortgageAnalysis {
  level: ResultLevel;
  summary: string;
  strengths: string[];
  warnings: string[];
  recommendations: string[];
}

export function analyzeMortgage(
  result: MortgageCalculationResult,
  level: ResultLevel
): MortgageAnalysis {
  const strengths: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (result.interestPercentage < 35) {
    strengths.push("A large portion of your payments goes toward the principal.");
  } else {
    warnings.push("A significant portion of your payments is interest.");
  }

  if (result.loanTermYears <= 20) {
    strengths.push("A shorter loan term reduces total interest paid.");
  } else {
    warnings.push("A longer loan term increases the total interest cost.");
    recommendations.push("Compare a 20-year or 15-year mortgage scenario.");
  }

  if (result.annualInterestRate > 6) {
    recommendations.push("Consider refinancing if lower interest rates become available.");
  }

  recommendations.push("Increase the down payment to reduce the loan amount.");
  recommendations.push("Compare multiple mortgage scenarios before making a decision.");

  return {
    level,
    summary:
      "This analysis evaluates the mortgage using interest cost, loan term, and payment structure.",
    strengths,
    warnings,
    recommendations,
  };
}
