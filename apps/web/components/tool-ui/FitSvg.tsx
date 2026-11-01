"use client";
import { useLayoutEffect, useState, type Ref, type SVGProps } from "react";
import { NO_MARGINS, placeClear, type Box } from "./chartLabels";
import { NUDGE, inkBox, useLabelFit } from "./useChartLabels";

/**
 * `<svg>` for a hand-drawn chart with its labels kept readable (§39, shared chart label layout):
 * - edges: the viewBox grows by the measured overflow of its labels (`useLabelFit`), and a numeric
 *   `width` / `height` grows with it, so the drawing keeps its scale and nothing is cut at the edge;
 * - collisions: a label whose glyphs touch an earlier label (document order: axes and bars are drawn
 *   first, values and notes after) is moved the least (`placeClear`) to a free spot inside the drawing.
 *   Moves are computed from each label's own position every time, so they settle instead of drifting.
 * - edges, when the drawing cannot grow (`grow={false}`: an SVG sized to a box with overlays drawn in its
 *   view units, e.g. the indicator kit's drag handle): a label crossing the edge is moved back inside.
 * Labels with their own `transform` (rotated) or marked `data-label-pin` never move.
 * Same props as `<svg>`; `viewBox` must be "x y w h" in numbers.
 */
export default function FitSvg({ viewBox, width, height, children, ref: outerRef, grow = true, ...rest }: SVGProps<SVGSVGElement> & { viewBox: string; ref?: Ref<SVGSVGElement>; grow?: boolean }) {
  const [vx, vy, vw, vh] = viewBox.split(/[\s,]+/).map(Number);
  const [fitRef, measured] = useLabelFit(viewBox);
  const fit = grow ? measured : { ...measured, margins: NO_MARGINS };
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  // viewBox units per rendered px: the margins are measured in px
  const k = fit.width ? vw / Math.max(1, fit.width - fit.margins.left - fit.margins.right) : 1;
  const m = fit.margins;
  const box = { x: vx - m.left * k, y: vy - m.top * k, w: vw + (m.left + m.right) * k, h: vh + (m.top + m.bottom) * k };
  const scaled = (size: SVGProps<SVGSVGElement>["width"], from: number, to: number) => (typeof size === "number" ? (size * to) / from : size);

  useCollisionFree(svg, `${viewBox}|${fit.width}|${fit.height}|${m.left},${m.right},${m.top},${m.bottom}`);

  return (
    <svg
      ref={(node) => {
        fitRef(node);
        if (typeof outerRef === "function") outerRef(node);
        else if (outerRef) outerRef.current = node;
        if (node && !node.closest("[data-phone-mini-slot]")) setSvg(node);
      }}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      width={scaled(width, vw, box.w)}
      height={scaled(height, vh, box.h)}
      {...rest}
    >
      {children}
    </svg>
  );
}


/** The collision pass of `FitSvg`: label moves applied as a `translate` the chart's own markup never sets. */
function useCollisionFree(svg: SVGSVGElement | null, key: string) {
  useLayoutEffect(() => {
    if (!svg) return;
    let frame = 0;
    const run = () => {
      frame = 0;
      const r = svg.getBoundingClientRect();
      const m = svg.getScreenCTM();
      if (!r.width || !m) return;
      const scale = Math.sqrt(Math.abs(m.a * m.d)) || 1;
      const texts = [...svg.querySelectorAll("text")].filter((t) => t.textContent?.trim());
      // each label at its own position: the current move taken back out of the measured box
      const items = texts.map((t) => {
        const [dx, dy] = (t.getAttribute(NUDGE) ?? "0,0").split(",").map(Number);
        const b = inkBox(t);
        const base: Box = { left: b.left - r.left - dx * scale, right: b.right - r.left - dx * scale, top: b.top - r.top - dy * scale, bottom: b.bottom - r.top - dy * scale };
        const movable = !t.hasAttribute("data-label-pin") && (!t.hasAttribute("transform") || t.hasAttribute(NUDGE));
        return { t, base, movable, dx, dy };
      });
      const frameBox = { left: 0, right: r.width, top: 0, bottom: r.height };
      const placed: (Box & { text: string })[] = [];
      const inside = (b: Box) => b.left >= -0.5 && b.right <= r.width + 0.5 && b.top >= -0.5 && b.bottom <= r.height + 0.5;
      for (const it of items) {
        const text = it.t.textContent ?? "";
        // a halo copy (the same text drawn under the label as an outline) is not a collision
        const others = placed.filter((p) => p.text !== text);
        const hit = !inside(it.base) || others.some((p) => !(it.base.right <= p.left || p.right <= it.base.left || it.base.bottom <= p.top || p.bottom <= it.base.top));
        let mx = 0;
        let my = 0;
        if (hit && it.movable) {
          const w = it.base.right - it.base.left;
          const h = it.base.bottom - it.base.top;
          ({ dx: mx, dy: my } = placeClear(it.base, others, frameBox, { x: w / 2, y: h }));
        }
        placed.push({ text, left: it.base.left + mx, right: it.base.right + mx, top: it.base.top + my, bottom: it.base.bottom + my });
        const ux = Math.round((mx / scale) * 2) / 2;
        const uy = Math.round((my / scale) * 2) / 2;
        if (ux === it.dx && uy === it.dy) continue;
        if (ux || uy) {
          it.t.setAttribute(NUDGE, `${ux},${uy}`);
          it.t.setAttribute("transform", `translate(${ux} ${uy})`);
        } else {
          it.t.removeAttribute(NUDGE);
          it.t.removeAttribute("transform");
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    run();
    // the chart re-renders its labels (new values, drag, resize): place them again
    const mo = new MutationObserver((records) => {
      if (records.some((rec) => !(rec.type === "attributes" && (rec.attributeName === "transform" || rec.attributeName === NUDGE)))) schedule();
    });
    mo.observe(svg, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["x", "y", "dx", "dy", "transform", "style", NUDGE] });
    const ro = new ResizeObserver(schedule);
    ro.observe(svg);
    void document.fonts?.ready.then(schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    return () => {
      document.fonts?.removeEventListener("loadingdone", schedule);
      if (frame) cancelAnimationFrame(frame);
      mo.disconnect();
      ro.disconnect();
    };
  }, [svg, key]);
}
