"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";

export type FuelLiveInputs = {
  currency: CurrencyCode;
  digitStyle: DigitStyle;
};

/**
 * Bridges the calculator's live currency selection to client components nested
 * inside `education`, which is instantiated once, server-side, with no props
 * (the shared pattern every tool on this site uses for its education slot).
 * Context propagates through that server-rendered subtree regardless of the
 * RSC boundary, so a client component anywhere inside it can still read the
 * currency the user has picked above, matching Compound Interest Calculator's
 * own LiveInputsContext.
 */
const FuelLiveInputsContext = createContext<FuelLiveInputs | null>(null);

export function FuelLiveInputsProvider({ value, children }: { value: FuelLiveInputs; children: ReactNode }) {
  return <FuelLiveInputsContext.Provider value={value}>{children}</FuelLiveInputsContext.Provider>;
}

export function useFuelLiveInputs() {
  return useContext(FuelLiveInputsContext);
}
