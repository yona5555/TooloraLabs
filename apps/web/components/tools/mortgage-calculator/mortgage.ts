import {
  calculateMortgage as calculateCoreMortgage,
  type MortgageInput,
} from "@/lib/calculators/mortgage";

import type { MortgageResult } from "./types";

type CalculatorInput = MortgageInput & {
  loanAmount: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
};

export function calculateMortgage(input: CalculatorInput): MortgageResult {
  const core = calculateCoreMortgage({
    homePrice: input.homePrice,
    downPayment: input.downPayment,
    annualInterestRate: input.annualInterestRate,
    loanTermYears: input.loanTermYears,
  });

  return {
    ...input,
    monthlyPrincipalAndInterest: core.monthlyPayment,
    monthlyTaxes: input.annualPropertyTax / 12,
    monthlyInsurance: input.annualHomeInsurance / 12,
    monthlyHOAFee: input.monthlyHOA,
    monthlyPMIFee: input.monthlyPMI,
    monthlyPayment:
      core.monthlyPayment +
      input.annualPropertyTax / 12 +
      input.annualHomeInsurance / 12 +
      input.monthlyHOA +
      input.monthlyPMI,
    totalPayment: core.totalPayment,
    totalInterest: core.totalInterest,
  };
}
