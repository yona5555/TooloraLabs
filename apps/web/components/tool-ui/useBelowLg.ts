"use client";
import { useEffect, useState } from "react";

/**
 * True below the `lg` breakpoint (1024px). There `svg { max-width: 100% }` (globals.css) scales a
 * fixed-width chart down to its box instead of letting it scroll, so a chart that sets its own width
 * (a minimum bar step, say) should lay out at the box width there: its labels then stay at true
 * CSS px (visuals.md: chart labels >= 12px) instead of shrinking with the whole drawing.
 * False on the server and the first client render (hydration-safe), then follows the viewport.
 */
export function useBelowLg(): boolean {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const read = () => setBelow(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return below;
}
