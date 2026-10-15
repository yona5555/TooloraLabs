"use client";
import { createContext, useContext } from "react";
import type { TargetHeartRateResult } from "./types";

/**
 * The calculator's last valid result (with the age and resting HR it came from), shared with the
 * indicator cards in the education section, plus the live training intensity: the zone-strip
 * card drags it, and the Result table and the beating 3D heart follow.
 */
export type HRSnapshot = { data: TargetHeartRateResult; age: number; rest: number | null };

export type HRLive = { snap: HRSnapshot; intensity: number; setIntensity: (pct: number) => void };

export const HRLiveContext = createContext<HRLive | null>(null);

export function useHRLive(): HRLive {
  const v = useContext(HRLiveContext);
  if (!v) throw new Error("useHRLive outside HRLiveContext");
  return v;
}
