"use client";
import { createContext, useContext } from "react";
import type { BMRFormula } from "@tooloralabs/tools";
import type { Body, Which } from "./bmr";

/**
 * The calculator's last valid measurements and both BMR estimates, shared with the indicator
 * cards in the education section (they render inside BMRCalculator's tree). `which`/`bmr` are the
 * estimate the Result headline follows. Writers: the zone strip drags the weight field and the
 * age curve drags the age field.
 */
export type BMRLive = {
  body: Body;
  hb: number;
  msj: number;
  formula: BMRFormula;
  which: Which;
  bmr: number;
  setWeightKg: (kg: number) => void;
  setAge: (years: number) => void;
};

export const BMRLiveContext = createContext<BMRLive | null>(null);

export function useBMRLive(): BMRLive {
  const v = useContext(BMRLiveContext);
  if (!v) throw new Error("useBMRLive outside BMRLiveContext");
  return v;
}
