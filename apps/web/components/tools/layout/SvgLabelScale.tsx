"use client";
import { useEffect } from "react";

/**
 * Chart labels in rendered CSS px (visuals.md): sets `--svg-k` on every SVG of the tool or docs page to its
 * viewBox units per rendered CSS px, so label sizes written with `svgPx(n)` (tool-ui/svgPx) never render
 * below 12px when CSS scales a fixed-viewBox chart down (`svg { max-width: 100% }` below lg, `w-full`
 * charts in a narrow card). 1 when the chart is not scaled down; never below 1, so a chart drawn larger
 * than its viewBox keeps its authored sizes. Layout width is used (not getScreenCTM), so the phone
 * mini-card copies, which are CSS-transformed thumbnails of the same drawing, keep the original's sizes.
 */
function unitsPerPx(svg: SVGSVGElement): number {
  const vb = svg.viewBox?.baseVal;
  const w = svg.clientWidth;
  const h = svg.clientHeight;
  if (!vb || !vb.width || !vb.height || !w || !h) return 1;
  // preserveAspectRatio "meet" (the default) fits the smaller ratio; "none" stretches: the smaller still bounds the glyphs
  const scale = Math.min(w / vb.width, h / vb.height);
  return Math.max(1, 1 / scale);
}

export default function SvgLabelScale() {
  useEffect(() => {
    const main = document.querySelector("main[data-phone-cards], main[data-docs-page]");
    if (!main) return;
    const seen = new WeakSet<Element>();
    const update = (svg: SVGSVGElement) => {
      const k = unitsPerPx(svg).toFixed(3);
      if (svg.style.getPropertyValue("--svg-k") !== k) svg.style.setProperty("--svg-k", k);
    };
    const ro = new ResizeObserver((entries) => entries.forEach((e) => update(e.target as SVGSVGElement)));
    const scan = () => {
      for (const svg of main.querySelectorAll<SVGSVGElement>("svg[viewBox]")) {
        if (seen.has(svg) || svg.parentElement?.closest("svg")) continue;
        seen.add(svg);
        ro.observe(svg);
        update(svg);
      }
    };
    scan();
    // charts mount lazily (cards opened, islands scrolled into view, tab switches), and a chart that
    // re-lays out to its measured box changes its viewBox without its box changing size
    const mo = new MutationObserver((records) => {
      let added = false;
      for (const r of records) {
        if (r.type === "childList") added = true;
        else if (r.target instanceof SVGSVGElement) update(r.target);
      }
      if (added) scan();
    });
    mo.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["viewBox"] });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, []);
  return null;
}
