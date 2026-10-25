"use client";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * For a chart drawn in a fixed `maxW`-wide viewBox (`width={W}`): the width it can really have, so on a
 * card narrower than `maxW` it is laid out at that width (viewBox width = CSS px) instead of being scaled
 * down as a whole by `svg { max-width: 100% }`. Its labels then render at their true size (visuals.md:
 * chart labels >= 12 CSS px) and keep their spacing. Measures the SVG's parent (the room it is given),
 * never the SVG itself, so it follows the card both ways. Where there is room, W stays `maxW` and any CSS
 * that stretches the SVG keeps working as before. `maxW` on the server and first render (hydration-safe).
 */
export function useFitWidth(maxW: number, minW = 200) {
  const ref = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(maxW);
  useLayoutEffect(() => {
    const box = ref.current?.parentElement;
    if (!box) return;
    const ro = new ResizeObserver(() => {
      const cs = getComputedStyle(box);
      const room = box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (room > 0) setW(Math.max(minW, Math.min(maxW, Math.round(room))));
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [maxW, minW]);
  return [ref, w] as const;
}
