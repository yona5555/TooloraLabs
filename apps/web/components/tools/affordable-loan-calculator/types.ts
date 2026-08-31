export type AffordableLoanMode = "maxLoan" | "requiredPayment";

export const AFFORDABLE_LOAN_MODES: AffordableLoanMode[] = ["maxLoan", "requiredPayment"];

/** One row of the term-sensitivity comparison: how the current loan amount / monthly payment plays out at a different term length. */
export type TermComparisonRow = {
  termYears: number;
  monthlyPaymentForLoan: number;
  maxLoanForPayment: number;
};
