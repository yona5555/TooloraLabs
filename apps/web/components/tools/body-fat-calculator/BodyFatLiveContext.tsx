"use client";
import { createContext, useContext } from "react";
import type { BodyFatCategory } from "@tooloralabs/tools";
import type { Measures } from "./ace";

/**
 * The calculator's last valid result and measurements, shared with the indicator cards in the
 * education section (they render inside BodyFatCalculator's tree). Writers: the zone strip drags
 * the waist field, and the composition card sets the body weight the fat/lean split is read at
 * (the Navy method needs no weight, so it is an assumed value seeded at BMI 22 for the height).
 */
export type BodyFatLive = {
  m: Measures;
  bf: number;
  category: BodyFatCategory;
  weightKg: number;
  weightSeed: number;
  setWeightKg: (kg: number) => void;
  setWaistCm: (cm: number) => void;
};

export const BodyFatLiveContext = createContext<BodyFatLive | null>(null);

export function useBodyFatLive(): BodyFatLive {
  const v = useContext(BodyFatLiveContext);
  if (!v) throw new Error("useBodyFatLive outside BodyFatLiveContext");
  return v;
}
