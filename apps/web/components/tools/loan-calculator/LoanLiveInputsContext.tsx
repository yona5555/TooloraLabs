"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { DigitStyle } from "@tooloralabs/core";
import type { LoanPaymentRow } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";

export type LoanLiveInputs = {
  hasCalculatedAmortized: boolean;
  amortizedSchedule: LoanPaymentRow[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

/**
 * Bridges the calculator's live Amortized-loan result to client components nested inside
 * `education`, which is instantiated once, server-side, with no props (the shared pattern
 * every tool on this site uses for its education slot). Context propagates through that
 * server-rendered subtree regardless of the RSC boundary, so a client component anywhere
 * inside it can still read the latest Calculate result. Scoped to the Amortized result
 * specifically (not whichever tab is currently active) because the payment-split concept
 * this chart illustrates only applies to fixed-payment amortized loans.
 */
const LoanLiveInputsContext = createContext<LoanLiveInputs | null>(null);

export function LoanLiveInputsProvider({ value, children }: { value: LoanLiveInputs; children: ReactNode }) {
  return <LoanLiveInputsContext.Provider value={value}>{children}</LoanLiveInputsContext.Provider>;
}

export function useLoanLiveInputs() {
  return useContext(LoanLiveInputsContext);
}
