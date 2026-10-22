"use client";
import { createContext, useContext } from "react";
import type { DistanceUnit } from "@tooloralabs/tools";
import type { SolveField, TopMode } from "./types";

/**
 * The active mode's last valid effort (distance in km and elapsed time), shared with the Result
 * table, the 3D track and the indicator cards. Finish-time mode adds its target race and
 * prediction; multipoint adds its split segments (km / seconds); converter mode has no distance,
 * so its effort is a 10 km reference at the entered pace (`assumedDistance`).
 */
export type PaceSegment = { from: number; to: number; km: number; sec: number };

export type PaceSnapshot = {
  mode: TopMode;
  unit: DistanceUnit;
  km: number;
  sec: number;
  solveFor?: SolveField;
  targetKm?: number;
  predictedSec?: number;
  segments?: PaceSegment[];
  assumedDistance?: boolean;
};

export const paceOf = (s: PaceSnapshot) => s.sec / s.km;

export const PaceLiveContext = createContext<PaceSnapshot | null>(null);

export function usePaceLive(): PaceSnapshot {
  const v = useContext(PaceLiveContext);
  if (!v) throw new Error("usePaceLive outside PaceLiveContext");
  return v;
}
