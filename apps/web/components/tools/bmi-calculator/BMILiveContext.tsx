"use client";
import { createContext, useContext } from "react";
import type { BMIExtendedResult } from "./types";

/**
 * The calculator's live result, shared with the indicator cards in the education section (they
 * render inside BMICalculator's tree), plus a writer so the zone-strip card can drag the weight
 * field: the inputs, the Result table and the 3D figure all follow.
 */
export type BMILive = { result: BMIExtendedResult; setWeightKg: (kg: number) => void };

export const BMILiveContext = createContext<BMILive | null>(null);

export function useBMILive(): BMILive {
  const v = useContext(BMILiveContext);
  if (!v) throw new Error("useBMILive outside BMILiveContext");
  return v;
}
