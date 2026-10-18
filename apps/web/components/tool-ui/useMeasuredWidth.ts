"use client";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Width of the element in real pixels, for an SVG drawn at its container's width (viewBox width =
 * pixel width), so its text keeps its true size while the drawing fills the card.
 */
export function useMeasuredWidth<T extends HTMLElement = HTMLDivElement>(initial: number, min = 260) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(min, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, width] as const;
}
