export interface MortgageCalculationResult {
  loanAmount: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;

  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;

  principalPercentage: number;
  interestPercentage: number;
}
