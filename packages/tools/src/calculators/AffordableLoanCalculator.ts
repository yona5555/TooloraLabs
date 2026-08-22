export type AffordableLoanResult = {
  monthlyPayment: number;
  maxLoanAmount: number;
  totalPayment: number;
  totalInterest: number;
};

/**
 * The reverse of a standard amortizing-loan calculation: given a monthly
 * payment you can comfortably afford, finds the maximum loan amount that
 * payment supports at a given interest rate and term — the same present
 * value of an annuity formula LoanCalculator solves in the other direction.
 */
export function calculateAffordableLoan(
  monthlyPayment: number,
  annualInterestRate: number,
  loanTermYears: number
): AffordableLoanResult {
  if (
    !Number.isFinite(monthlyPayment) ||
    monthlyPayment <= 0 ||
    !Number.isFinite(annualInterestRate) ||
    annualInterestRate < 0 ||
    !Number.isFinite(loanTermYears) ||
    loanTermYears <= 0
  ) {
    return { monthlyPayment: 0, maxLoanAmount: 0, totalPayment: 0, totalInterest: 0 };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = Math.round(loanTermYears * 12);

  const maxLoanAmount =
    monthlyRate === 0
      ? monthlyPayment * numberOfPayments
      : (monthlyPayment * (1 - Math.pow(1 + monthlyRate, -numberOfPayments))) / monthlyRate;

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - maxLoanAmount;

  return { monthlyPayment, maxLoanAmount, totalPayment, totalInterest };
}
