"use client";
import { createContext, useContext } from "react";
import type { PregSnapshot } from "./preg";

/**
 * The calculator's last valid result (LMP, today, gestational age, due date, week milestone),
 * shared with the input-column ladder, the Result card and the indicator cards. The ladder and
 * the timeline card write back a gestational age (in days): the LMP becomes today − that many
 * days, so dragging moves the date input, the Result table and the 3D scene.
 */
export type PregnancyLive = {
  snap: PregSnapshot;
  setGa: (days: number) => void;
};

export const PregnancyLiveContext = createContext<PregnancyLive | null>(null);

export function usePregnancyLive(): PregnancyLive {
  const v = useContext(PregnancyLiveContext);
  if (!v) throw new Error("usePregnancyLive outside PregnancyLiveContext");
  return v;
}
