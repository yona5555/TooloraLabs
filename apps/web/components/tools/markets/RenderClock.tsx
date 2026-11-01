"use client";
import { createContext, useContext, type ReactNode } from "react";

/**
 * The server's render time, sent in the RSC payload only by the tools that read it (the tool's entry, or the
 * [slug] route for the live-data tools), so the first client render reads the same clock as the HTML. Live-data pages are ISR-cached and the other tool pages are
 * prerendered at build time, so `Date.now()` at hydration can be hours or days past the render: a relative
 * label ("21 hours ago") or a "today" default would not match the HTML (React #418).
 */
const RenderClock = createContext<number | null>(null);

export function RenderClockProvider({ renderedAt, children }: { renderedAt: number; children: ReactNode }) {
  return <RenderClock.Provider value={renderedAt}>{children}</RenderClock.Provider>;
}

export const useRenderedAt = () => useContext(RenderClock);
