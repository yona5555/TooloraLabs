"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { AngleMode } from "@tooloralabs/tools";

/**
 * The smallest additive, read-only window into the calculator's own state (§ "hands off the
 * calculator"): angle mode and the current display string. Nothing here can write back into the
 * calculator -- there is no setter exported, only a value. The sidebar panels below the History
 * card seed themselves ONCE from this on mount and otherwise ignore it, except the live Deg/Rad
 * label on the unit-circle card, which reads `angleMode` on every render by design.
 */
export type ScientificCalcReadonly = { angleMode: AngleMode; display: string };

const ScientificCalcReadonlyCtx = createContext<ScientificCalcReadonly>({ angleMode: "deg", display: "0" });

export function ScientificCalcReadonlyProvider({ value, children }: { value: ScientificCalcReadonly; children: ReactNode }) {
  return <ScientificCalcReadonlyCtx.Provider value={value}>{children}</ScientificCalcReadonlyCtx.Provider>;
}

export function useScientificCalcReadonly(): ScientificCalcReadonly {
  return useContext(ScientificCalcReadonlyCtx);
}
