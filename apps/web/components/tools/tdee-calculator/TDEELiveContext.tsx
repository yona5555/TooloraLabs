"use client";
import { createContext, useContext } from "react";
import type { ActivityLevel, Gender, GoalDirection } from "./types";

/**
 * The calculator's last valid result (with the body it came from), shared with the indicator
 * cards in the education section. The activity-steps card writes the activity level back, so
 * dragging it moves the Result table and the 3D energy towers.
 */
export type TDEESnapshot = {
  bmr: number;
  tdee: number;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  /** Body fat % when the visitor gave it (Katch-McArdle), else null (Mifflin-St Jeor). */
  bodyFat: number | null;
  goalDirection: GoalDirection;
  /** Signed weekly change in kg (negative = lose). */
  weeklyKg: number;
  dailyTarget: number;
};

export type TDEELive = { snap: TDEESnapshot; setActivityLevel: (level: ActivityLevel) => void };

export const TDEELiveContext = createContext<TDEELive | null>(null);

export function useTDEELive(): TDEELive {
  const v = useContext(TDEELiveContext);
  if (!v) throw new Error("useTDEELive outside TDEELiveContext");
  return v;
}
