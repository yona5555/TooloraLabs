"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { NO_MARGINS, marginDelta, nextMargins, type Box, type Margins } from "./chartLabels";

/**
 * The DOM half of the shared chart label layout (`chartLabels.ts` holds the geometry): measures label text
 * as it is really drawn — canvas `measureText` in the label's own computed font, so the glyph ink, not
 * the font box (IBM Plex Sans Arabic's font box is 0.18em deeper than Arimo's for the same digits) — and
 * feeds those boxes back into the chart's layout.
 */

/** Attribute holding a label's collision move ("dx,dy" viewBox units), set by `FitSvg`. */
export const NUDGE = "data-label-nudge";

let canvas: CanvasRenderingContext2D | null = null;
const metricsCache = new Map<string, TextMetrics>();

function metrics(text: string, font: string): TextMetrics {
  const key = `${font}\n${text}`;
  let m = metricsCache.get(key);
  if (!m) {
    canvas ??= document.createElement("canvas").getContext("2d");
    if (!canvas) throw new Error("useChartLabels: 2D canvas unavailable");
    canvas.font = font;
    canvas.textAlign = "left";
    m = canvas.measureText(text);
    metricsCache.set(key, m);
  }
  return m;
}

const cssFont = (cs: CSSStyleDeclaration, size = cs.fontSize, weight = cs.fontWeight) => `${cs.fontStyle} ${weight} ${size} ${cs.fontFamily}`;

/**
 * Glyph ink box of a rendered <text> in viewport px. An upright single-line label is measured from its
 * own font (baseline = font box bottom − font descent); a rotated or multi-line one keeps its font box.
 */
export function inkBox(t: SVGTextElement): Box {
  const e = t.getBoundingClientRect();
  const m = t.getScreenCTM();
  const multiLine = [...t.querySelectorAll("tspan")].some((s) => s.hasAttribute("x") || s.hasAttribute("y") || s.hasAttribute("dy"));
  if (!m || Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || multiLine) return { left: e.left, right: e.right, top: e.top, bottom: e.bottom };
  const scale = Math.sqrt(Math.abs(m.a * m.d));
  const tm = metrics(t.textContent ?? "", cssFont(getComputedStyle(t)));
  const base = e.bottom - tm.fontBoundingBoxDescent * scale;
  return { left: e.left - tm.actualBoundingBoxLeft * scale, right: e.left + tm.actualBoundingBoxRight * scale, top: base - tm.actualBoundingBoxAscent * scale, bottom: base + tm.actualBoundingBoxDescent * scale };
}

/** Width, ascent and descent (ink, px) of `text` set at `px` in the font of `el`. */
export type Measure = (text: string, px: number, weight?: number) => { width: number; ascent: number; descent: number };

function measureIn(el: Element): Measure {
  const cs = getComputedStyle(el);
  return (text, px, weight) => {
    const m = metrics(text, cssFont(cs, `${px}px`, weight === undefined ? cs.fontWeight : String(weight)));
    return { width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
  };
}

/**
 * Fallback before the first client measurement (server render, first paint): Arimo proportions, so the
 * server HTML is already close and the measured layout replaces it in the same frame (layout effect).
 */
const estimate: Measure = (text, px) => ({ width: text.length * px * 0.62, ascent: px * 0.72, descent: px * 0.21 });

/** Root element given by a callback ref; the phone mini-card copy (an 88px thumbnail of the same drawing) is ignored. */
function useChartRoot<T extends Element>() {
  const [el, setEl] = useState<T | null>(null);
  const [ref] = useState(() => (node: T | null) => {
    if (node && !node.closest("[data-phone-mini-slot]")) setEl(node);
  });
  return [el, ref] as const;
}

const svgOf = (root: Element | null) => (root instanceof SVGSVGElement ? root : root?.querySelector("svg") ?? null);

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
    // every web font that finishes loading (a lazily used face too, after `ready` has resolved) re-measures
    const onFonts = () => {
      metricsCache.clear();
      if (live) setState((s) => ({ ...s, measure: measureIn(el) }));
    };
    document.fonts.addEventListener("loadingdone", onFonts);
    void document.fonts.ready.then(onFonts);
    return () => {
      live = false;
      mo.disconnect();
      document.fonts.removeEventListener("loadingdone", onFonts);
    };
  }, [el]);
  return [ref, state.measure, state.k] as const;
}

/** Fit steps per layout before the margins are frozen (the layout cannot oscillate). */
const MAX_FIT_STEPS = 8;

/**
 * Margins (px) that keep every label of the chart inside its drawing, measured on the rendered chart:
 * after each change of the drawing (re-render, resize, font load) the labels' ink boxes are compared with
 * the SVG's box and the margins move by `marginDelta` until no label is cut. Labels
 * marked `data-label-float` (a label that follows a dragged point) are left out: they are placed with
 * `pickSide` / `clampInto` instead, so dragging never resizes the plot. `key` names the layout (data
 * range, inputs); a new key restarts the step count. `boxes` are the measured labels in the drawing's px. `floorOf(width, height, margins)` (px, ≤ 0) lets a
 * margin go below 0 by the room a view keeps beyond its area of interest (Mafs' own padding), never into it. Also returns the drawing's size in px and `measure`
 * in the drawing's font, for placing those floating labels.
 */
export function useLabelFit(key: string, floorOf?: (width: number, height: number, margins: Margins) => Margins) {
  const [el, ref] = useChartRoot<Element>();
  const floorRef = useRef(floorOf);
  useLayoutEffect(() => {
    floorRef.current = floorOf;
  });
  const [fit, setFit] = useState<{ margins: Margins; width: number; height: number; measure: Measure; boxes: Box[] }>({ margins: NO_MARGINS, width: 0, height: 0, measure: estimate, boxes: [] });
  useLayoutEffect(() => {
    if (!el) return;
    let steps = 0;
    let frame = 0;
    let live = true;
    const measure = () => {
      frame = 0;
      // looked up each time: a chart library (Mafs) mounts its SVG only after measuring its box
      const svg = svgOf(el);
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // each label at its own position: a collision move (FitSvg) is taken back out, so moves never feed the margins
      const scale = Math.sqrt(Math.abs((svg.getScreenCTM()?.a ?? 1) * (svg.getScreenCTM()?.d ?? 1))) || 1;
      const boxes = [...svg.querySelectorAll("text")]
        .filter((t) => t.textContent?.trim() && !t.closest("[data-label-float]"))
        .map((t) => {
          const b = inkBox(t);
          const [dx, dy] = (t.getAttribute(NUDGE) ?? "0,0").split(",").map(Number);
          return { left: b.left - dx * scale, right: b.right - dx * scale, top: b.top - dy * scale, bottom: b.bottom - dy * scale };
        });
      setFit((f) => {
        const fl = floorRef.current?.(r.width, r.height, f.margins) ?? NO_MARGINS;
        const margins = nextMargins(f.margins, marginDelta(boxes, r, f.margins, fl), steps >= MAX_FIT_STEPS, fl);
        // the labels' boxes in the drawing's own px (origin top-left), for labels placed around them
        const rel = boxes.map((b) => ({ left: Math.round(b.left - r.left), right: Math.round(b.right - r.left), top: Math.round(b.top - r.top), bottom: Math.round(b.bottom - r.top) }));
        const same = rel.length === f.boxes.length && rel.every((b, i) => b.left === f.boxes[i].left && b.top === f.boxes[i].top && b.right === f.boxes[i].right && b.bottom === f.boxes[i].bottom);
        if (margins === f.margins && same && f.width === r.width && f.height === r.height && f.measure !== estimate) return f;
        if (margins !== f.margins) steps++;
        return { margins, width: r.width, height: r.height, measure: f.measure === estimate ? measureIn(svg) : f.measure, boxes: same ? f.boxes : rel };
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    // the chart library mounts and re-renders its own SVG (ticks, labels) after our margins reach it
    const mo = new MutationObserver(schedule);
    mo.observe(el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["x", "y", "viewBox", "transform"] });
    const onFonts = () => {
      if (!live) return;
      metricsCache.clear();
      setFit((f) => ({ ...f, measure: estimate }));
      schedule();
    };
    document.fonts.addEventListener("loadingdone", onFonts);
    void document.fonts.ready.then(onFonts);
    return () => {
      live = false;
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      document.fonts.removeEventListener("loadingdone", onFonts);
    };
  }, [el, key]);
  return [ref, fit] as const;
}
