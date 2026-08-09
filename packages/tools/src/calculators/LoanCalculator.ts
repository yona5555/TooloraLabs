export type LoanAmortizationMonth = {
  month: number;
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type LoanAmortizationYear = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type LoanResult = {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: LoanAmortizationYear[];
  monthlySchedule: LoanAmortizationMonth[];
};

/**
 * A standard fixed-rate installment loan (personal or auto) — the same
 * amortizing-payment math as a mortgage, deliberately without PMI, property
 * tax, or HOA, none of which apply to a non-real-estate loan.
 */
export function calculateLoan(loanAmount: number, annualInterestRate: number, loanTermYears: number): LoanResult {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !Number.isFinite(annualInterestRate) || !Number.isFinite(loanTermYears) || loanTermYears <= 0) {
    return { loanAmount: 0, monthlyPayment: 0, totalPayment: 0, totalInterest: 0, amortizationSchedule: [], monthlySchedule: [] };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = Math.round(loanTermYears * 12);

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / numberOfPayments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  let balance = loanAmount;
  let totalInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  const amortizationSchedule: LoanAmortizationYear[] = [];
  const monthlySchedule: LoanAmortizationMonth[] = [];

  for (let month = 1; month <= numberOfPayments && balance > 0.005; month++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = Math.min(Math.max(monthlyPayment - interestPortion, 0), balance);

    balance -= principalPortion;
    totalInterest += interestPortion;
    yearPrincipal += principalPortion;
    yearInterest += interestPortion;

    monthlySchedule.push({
      month,
      year: Math.ceil(month / 12),
      payment: Number((interestPortion + principalPortion).toFixed(2)),
      principalPaid: Number(principalPortion.toFixed(2)),
      interestPaid: Number(interestPortion.toFixed(2)),
      endingBalance: Number(Math.max(balance, 0).toFixed(2)),
    });

    if (month % 12 === 0 || balance <= 0.005) {
      amortizationSchedule.push({
        year: Math.ceil(month / 12),
        principalPaid: Number(yearPrincipal.toFixed(2)),
        interestPaid: Number(yearInterest.toFixed(2)),
        endingBalance: Number(Math.max(balance, 0).toFixed(2)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return {
    loanAmount,
    monthlyPayment,
    totalPayment: monthlyPayment * numberOfPayments,
    totalInterest,
    amortizationSchedule,
    monthlySchedule,
  };
}
