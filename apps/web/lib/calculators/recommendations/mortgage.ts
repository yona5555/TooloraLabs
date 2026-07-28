import { MortgageCalculationResult } from "../types/mortgage";

export interface MortgageRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export function getMortgageRecommendations(
  result: MortgageCalculationResult
): MortgageRecommendation[] {
  const recommendations: MortgageRecommendation[] = [];

  if (result.loanTermYears > 20) {
    recommendations.push({
      id: "shorter-term",
      title: "Compare a shorter loan term",
      description:
        "A shorter mortgage term can significantly reduce the total interest paid.",
      priority: "high",
    });
  }

  if (result.annualInterestRate > 6) {
    recommendations.push({
      id: "refinance",
      title: "Watch refinancing opportunities",
      description:
        "If market rates decrease, refinancing may reduce your monthly payment and total interest.",
      priority: "high",
    });
  }

  recommendations.push({
    id: "down-payment",
    title: "Increase the down payment",
    description:
      "A larger down payment reduces both the loan amount and the total interest.",
    priority: "medium",
  });

  recommendations.push({
    id: "compare-options",
    title: "Compare multiple scenarios",
    description:
      "Test different loan terms, interest rates, and down payments before making a final decision.",
    priority: "low",
  });

  return recommendations;
}
