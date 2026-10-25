"use client";
import { createContext, useContext, type ReactNode } from "react";

/**
 * The server's render time, sent in the RSC payload so the first client render reads the same clock
 * as the HTML. Live-data pages are ISR-cached, so `Date.now()` at hydration can be hours past the
 * render and a relative label ("21 hours ago") would not match the HTML (React #418).
 */
const RenderClock = createContext<number | null>(null);

export function RenderClockProvider({ renderedAt, children }: { renderedAt: number; children: ReactNode }) {
  return <RenderClock.Provider value={renderedAt}>{children}</RenderClock.Provider>;
}

export const useRenderedAt = () => useContext(RenderClock);
