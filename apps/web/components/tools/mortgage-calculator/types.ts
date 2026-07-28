export type MortgageInputs = {
  homePrice: number;
  downPayment: number;
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
};

export type AmortizationRow = {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type MortgageResult = MortgageInputs & {
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHOAFee: number;
  monthlyPMIFee: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};
