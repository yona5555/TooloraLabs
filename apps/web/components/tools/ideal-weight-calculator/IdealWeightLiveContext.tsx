"use client";
import { createContext, useContext } from "react";
import type { Gender, IdealWeightResult } from "@tooloralabs/tools";

/**
 * The calculator's last valid measurements and the four formula estimates, shared with the
 * indicator cards in the education section (they render inside IdealWeightCalculator's tree).
 * `current` is the current weight; when the optional field is empty it is an assumed value
 * (the weight at BMI 25 for this height) and `currentGiven` is false, so cards can label it.
 * Writers: the height sweep drags the height field and the WHO strip drags the weight field.
 */
export type IdealWeightLive = {
  gender: Gender;
  heightCm: number;
  current: number;
  currentGiven: boolean;
  r: IdealWeightResult;
  setHeightCm: (cm: number) => void;
  setCurrentKg: (kg: number) => void;
};

export const IdealWeightLiveContext = createContext<IdealWeightLive | null>(null);

export function useIdealWeightLive(): IdealWeightLive {
  const v = useContext(IdealWeightLiveContext);
  if (!v) throw new Error("useIdealWeightLive outside IdealWeightLiveContext");
  return v;
}
