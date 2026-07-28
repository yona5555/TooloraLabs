import { MortgageCalculationResult } from "./types/mortgage";

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
}

export function calculateMortgage(
  input: MortgageInput
): MortgageCalculationResult {
  const loanAmount = input.homePrice - input.downPayment;

  const monthlyRate = input.annualInterestRate / 100 / 12;
  const numberOfPayments = input.loanTermYears * 12;

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / numberOfPayments
      : (loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    loanAmount,
    downPayment: input.downPayment,
    annualInterestRate: input.annualInterestRate,
    loanTermYears: input.loanTermYears,

    monthlyPayment,
    totalPayment,
    totalInterest,

    principalPercentage: (loanAmount / totalPayment) * 100,
    interestPercentage: (totalInterest / totalPayment) * 100,
  };
}
