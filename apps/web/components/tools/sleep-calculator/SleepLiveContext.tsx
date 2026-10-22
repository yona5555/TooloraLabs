"use client";
import { createContext, useContext } from "react";
import type { SleepSnapshot } from "./sleep";

/**
 * The calculator's last valid result (mode, entered time, minutes to fall asleep and the four
 * nights), shared with the input-column ladder and the indicator cards. Two cards write back:
 * the 24-hour dial sets the entered time and the formula card sets the minutes to fall asleep,
 * so dragging them moves the inputs, the Result table and the 3D night clock.
 */
export type SleepLive = {
  snap: SleepSnapshot;
  setAnchor: (minutes: number) => void;
  setLatency: (minutes: number) => void;
};

export const SleepLiveContext = createContext<SleepLive | null>(null);

export function useSleepLive(): SleepLive {
  const v = useContext(SleepLiveContext);
  if (!v) throw new Error("useSleepLive outside SleepLiveContext");
  return v;
}
