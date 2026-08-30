import type { CompoundingFrequency, PaymentFrequency } from "@tooloralabs/tools";

export type { CompoundingFrequency, PaymentFrequency };

export type LoanMode = "amortized" | "deferred" | "bond";

export const LOAN_MODES: LoanMode[] = ["amortized", "deferred", "bond"];

/** Whether the loan term is entered in years or months — converted to years internally before calculating. */
export type TermUnit = "years" | "months";
