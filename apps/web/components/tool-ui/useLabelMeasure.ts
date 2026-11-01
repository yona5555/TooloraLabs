"use client";
import { useLayoutEffect, useState } from "react";
import { estimate, measureIn, metricsCache, useChartRoot, type Measure } from "./useChartLabels";

/**
 * Measured text for a hand-drawn SVG chart: `measure` in the chart's font (refreshed when web fonts finish
 * loading) and `k`, the chart's viewBox units per rendered px (`--svg-k`, what `svgPx` labels grow by), so
 * a layout in viewBox units uses the size the labels are really drawn at.
 */
export function useLabelMeasure() {
  const [el, ref] = useChartRoot<SVGSVGElement>();
  const [state, setState] = useState<{ measure: Measure; k: number }>({ measure: estimate, k: 1 });
  useLayoutEffect(() => {
    if (!el) return;
    let live = true;
    const update = () => {
      if (!live) return;
      const k = Math.max(1, parseFloat(getComputedStyle(el).getPropertyValue("--svg-k")) || 1);
      setState((s) => (s.measure !== estimate && s.k === k ? s : { measure: measureIn(el), k }));
    };
    update();
    // `--svg-k` is set on the SVG's style by SvgLabelScale; a font swap changes every measurement
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["style"] });
    const remeasure = () => {
      metricsCache.clear();
      if (live) setState((s) => ({ ...s, measure: measureIn(el) }));
    };
    void document.fonts?.ready.then(remeasure);
    document.fonts?.addEventListener("loadingdone", remeasure);
    return () => {
      live = false;
      document.fonts?.removeEventListener("loadingdone", remeasure);
      mo.disconnect();
    };
  }, [el]);
  return [ref, state.measure, state.k] as const;
}
