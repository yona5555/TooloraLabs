import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MortgageInput = {
  homePrice: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
};

export type MortgageResult = MortgageInput & {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHOAFee: number;
  monthlyPMIFee: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export class MortgageCalculator extends BaseCalculator<MortgageInput, MortgageResult> {
  metadata = {
    id: "mortgage-calculator",
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    category: "calculators",
    description:
      "Calculate monthly mortgage payments, total interest, and total repayment.",
    version: "1.0.0",
  };

  execute(
    input: MortgageInput,
    _context: ToolContext
  ): ToolResult<MortgageResult> {
    const loanAmount = input.homePrice - input.downPayment;
    const monthlyRate = input.annualInterestRate / 100 / 12;
    const numberOfPayments = input.loanTermYears * 12;

    const principalAndInterest =
      monthlyRate === 0
        ? loanAmount / numberOfPayments
        : (loanAmount *
            monthlyRate *
            Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = principalAndInterest * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    const monthlyTaxes = input.annualPropertyTax / 12;
    const monthlyInsurance = input.annualHomeInsurance / 12;

    return {
      success: true,
      data: {
        ...input,
        loanAmount,
        monthlyPrincipalAndInterest: principalAndInterest,
        monthlyTaxes,
        monthlyInsurance,
        monthlyHOAFee: input.monthlyHOA,
        monthlyPMIFee: input.monthlyPMI,
        monthlyPayment:
          principalAndInterest +
          monthlyTaxes +
          monthlyInsurance +
          input.monthlyHOA +
          input.monthlyPMI,
        totalPayment,
        totalInterest,
      },
      metadata: {},
    };
  }
}
