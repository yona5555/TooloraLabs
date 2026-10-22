"use client";
import { createContext, useContext } from "react";
import type { OvSnap } from "./ovulation";

/**
 * The calculator's last valid result (LMP, cycle length, luteal phase and the three projected
 * cycles it returned), shared with the input-column key dates, the Result card and the eight
 * indicator cards. The cycle-length and luteal-phase cards write back, so dragging them moves the
 * inputs, the Result table and the 3D cycle wheel together.
 */
export type OvLive = {
  snap: OvSnap;
  setCycle: (days: number) => void;
  setLuteal: (days: number) => void;
};

export const OvulationLiveContext = createContext<OvLive | null>(null);

export function useOvLive(): OvLive {
  const v = useContext(OvulationLiveContext);
  if (!v) throw new Error("useOvLive outside OvulationLiveContext");
  return v;
}

/** Localized date labels with Western digits, shared with the due-date visuals. */
export { useDateFmt, type DateFmt } from "../due-date-calculator/DueDateLiveContext";
