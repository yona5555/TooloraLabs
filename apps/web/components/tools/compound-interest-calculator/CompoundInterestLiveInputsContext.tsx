"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { DigitStyle } from "@tooloralabs/core";
import type { YearlyGrowthPoint, CompoundingFrequency } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";

export type CompoundInterestLiveInputs = {
  hasCalculated: boolean;
  currency: CurrencyCode;
  principal: number;
  rate: number;
  years: number;
  frequency: CompoundingFrequency;
  monthlyContribution: number;
  taxRate: number;
  yearlySchedule: YearlyGrowthPoint[];
  digitStyle: DigitStyle;
};

/**
 * Bridges the calculator's live client-side input state to client components
 * nested inside `education`, which is instantiated once, server-side, with no
 * props (the shared pattern every tool on this site uses for its education
 * slot). Context propagates through that server-rendered subtree regardless
 * of the RSC boundary, so a client component anywhere inside it can still
 * read values that change as the user edits the calculator above.
 */
const CompoundInterestLiveInputsContext = createContext<CompoundInterestLiveInputs | null>(null);

export function CompoundInterestLiveInputsProvider({
  value,
  children,
}: {
  value: CompoundInterestLiveInputs;
  children: ReactNode;
}) {
  return <CompoundInterestLiveInputsContext.Provider value={value}>{children}</CompoundInterestLiveInputsContext.Provider>;
}

export function useCompoundInterestLiveInputs() {
  return useContext(CompoundInterestLiveInputsContext);
}
