"use client";
import { useLayoutEffect, useState } from "react";

/**
 * The chart's own <svg>, through a callback ref rather than a ref object: most charts mount after the
 * first render (live data loaded, a card opened, a tab switched), and an effect keyed on a ref object
 * never sees that later SVG. The phone mini-card copy (PhoneMini renders the same element again into
 * an 88px chip) is ignored, so the measurements stay the full-size chart's. `ref.current` is kept for
 * pointer handlers.
 */
function useChartSvg() {
  const [el, setEl] = useState<SVGSVGElement | null>(null);
  const [ref] = useState(() => {
    const cb = ((node: SVGSVGElement | null) => {
      if (!node || node.closest("[data-phone-mini-slot]")) return;
      cb.current = node;
      setEl(node);
    }) as ((node: SVGSVGElement | null) => void) & { current: SVGSVGElement | null };
    cb.current = null;
    return cb;
  });
  return [el, ref] as const;
}

/**
 * For a chart drawn in a fixed `maxW`-wide viewBox (`width={W}`): the width it can really have, so on a
 * card narrower than `maxW` it is laid out at that width (viewBox width = CSS px) instead of being scaled
 * down as a whole by `svg { max-width: 100% }`. Its labels then render at their true size (visuals.md:
 * chart labels >= 12 CSS px) and keep their spacing. Measures the SVG's parent (the room it is given),
 * never the SVG itself, so it follows the card both ways. Where there is room, W stays `maxW` and any CSS
 * that stretches the SVG keeps working as before. `maxW` on the server and first render (hydration-safe).
 */
export function useFitWidth(maxW: number, minW = 200) {
  const [el, ref] = useChartSvg();
  const [w, setW] = useState(maxW);
  useLayoutEffect(() => {
    const box = el?.parentElement;
    if (!box) return;
    const ro = new ResizeObserver(() => {
      const cs = getComputedStyle(box);
      const room = box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (room > 0) setW(Math.max(minW, Math.min(maxW, Math.round(room))));
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [el, maxW, minW]);
  return [ref, w] as const;
}

/**
 * For a chart CSS scales to its box (fixed viewBox, `w-full`): viewBox units per rendered CSS px, the
 * same `--svg-k` that `svgPx` labels grow by, so label layout in viewBox units (widths, line gaps)
 * matches what is drawn. 1 on the server and first render (hydration-safe) and when not scaled down.
 */
export function useSvgUnitsPerPx(viewBoxW: number) {
  const [el, ref] = useChartSvg();
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) setK(Math.max(1, Math.round((viewBoxW / w) * 100) / 100));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [el, viewBoxW]);
  return [ref, k] as const;
}
