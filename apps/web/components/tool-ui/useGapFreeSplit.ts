"use client";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Layouts a drawing + table card can take. "side" is the original; the others are remedies used
 * only when "side" measures a gap (visuals.md "no empty gaps"):
 *  - "side-fill": drawing taller → table stretches to its height, rows spread over it;
 *  - "side-2col": table taller → rows in two columns (spread if the drawing is then taller);
 *  - "stacked":  drawing on top at full width, rows in a 3/2/1-column grid.
 */
export type GapLayout = "side" | "side-fill" | "side-2col" | "stacked";

const MAX_HEIGHT_RATIO = 1.3;
const MIN_WIDTH_FILL = 0.75;

/**
 * Measures each card on its own: keeps "side" when it has no gap, otherwise tries the remedies in
 * order and keeps the first that leaves no gap (same test as scripts/card-gap-check.mjs). Re-runs
 * only when the card's width changes. Below the side-by-side breakpoint the CSS stacks naturally
 * and nothing is changed. A pinned `layout` skips measuring.
 */
/**
 * Marks the part's largest drawing `data-gfr-main` (and the wrappers above it `data-gfr-wrap`) so a
 * stacked layout can widen it with CSS; clears the marks otherwise. Returns the marked drawing, or
 * null for an HTML indicator (its root is marked instead).
 */
function markMain(part: Element, on: boolean): Element | null {
  for (const el of part.querySelectorAll("[data-gfr-main]")) el.removeAttribute("data-gfr-main");
  for (const el of part.querySelectorAll("[data-gfr-wrap]")) el.removeAttribute("data-gfr-wrap");
  if (!on) return null;
  const area = (el: Element) => el.getBoundingClientRect().width * el.getBoundingClientRect().height;
  const main = [...part.querySelectorAll("svg, canvas")].filter((d) => !d.parentElement?.closest("svg")).sort((a, b) => area(b) - area(a))[0];
  if (!main) {
    // An HTML indicator (list, bars of divs): widen its root instead.
    part.firstElementChild?.setAttribute("data-gfr-main", "");
    return null;
  }
  main.setAttribute("data-gfr-main", "");
  for (let el = main.parentElement; el && el !== part; el = el.parentElement) el.setAttribute("data-gfr-wrap", "");
  return main;
}

/** Width the part's content really uses: the union of its visible children, looking through full-width wrappers. */
function usedWidth(el: Element): number {
  const shown = (k: Element) => k.getBoundingClientRect().width > 0 && k.getBoundingClientRect().height > 0;
  let kids = [...el.children].filter(shown);
  while (kids.length === 1 && kids[0].children.length && !["svg", "canvas"].includes(kids[0].tagName.toLowerCase()) && Math.abs(kids[0].getBoundingClientRect().width - el.getBoundingClientRect().width) < 2) {
    kids = [...kids[0].children].filter(shown);
  }
  if (kids.length === 0) return el.getBoundingClientRect().width;
  const rs = kids.map((k) => k.getBoundingClientRect());
  return Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left));
}

type St = { width: number; seq: GapLayout[]; i: number; done: boolean; best: { layout: GapLayout; bad: number } };
const fresh = (width: number): St => ({ width, seq: ["side"], i: 0, done: false, best: { layout: "side", bad: Infinity } });

export function useGapFreeSplit(pinned?: GapLayout) {
  const box = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<St>(fresh(0));

  useLayoutEffect(() => {
    if (pinned) return;
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const width = Math.round(e.contentRect.width);
      setSt((s) => (s.width === width ? s : fresh(width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned]);

  useLayoutEffect(() => {
    const el = box.current;
    // Without part refs (GapFreeRow), the box's first child is the drawing and its last the table.
    const ind = indicator.current ?? (el?.firstElementChild as HTMLElement | null);
    const tb = table.current ?? (el?.lastElementChild as HTMLElement | null);
    if (!el || !ind || !tb) return;
    if (pinned || st.done) {
      markMain(ind, (pinned ?? st.seq[st.i]) === "stacked");
      return;
    }
    if (st.width === 0) return;
    const layout = st.seq[st.i];
    let bad: number;
    let next = st.seq;
    const main = markMain(ind, layout === "stacked");
    if (layout === "stacked") {
      const fill = (main ? main.getBoundingClientRect().width : usedWidth(ind)) / Math.max(1, el.clientWidth);
      bad = fill >= MIN_WIDTH_FILL ? 0 : (MIN_WIDTH_FILL - fill) * 2;
    } else {
      if (getComputedStyle(el).flexDirection !== "row") {
        setSt((s) => ({ ...s, i: 0, seq: ["side"], done: true }));
        return;
      }
      const hD = ind.getBoundingClientRect().height;
      const hT = tb.getBoundingClientRect().height;
      const ratio = Math.max(hD, hT) / Math.max(1, Math.min(hD, hT));
      bad = ratio <= MAX_HEIGHT_RATIO ? 0 : ratio - MAX_HEIGHT_RATIO;
      if (layout === "side" && bad > 0) {
        // Remedies in order of least change; spreading rows only for a moderately taller drawing.
        next = hT > hD ? ["side", "side-2col", "stacked"] : ratio <= 2 ? ["side", "side-fill", "stacked"] : ["side", "stacked", "side-fill"];
      }
    }
    setSt((s) => {
      const best = bad < s.best.bad ? { layout, bad } : s.best;
      if (bad === 0) return { ...s, seq: next, done: true, best };
      if (s.i + 1 < next.length) return { ...s, seq: next, i: s.i + 1, best };
      const bi = next.indexOf(best.layout);
      return { ...s, seq: next, i: bi, done: true, best };
    });
  }, [pinned, st]);

  const layout: GapLayout = pinned ?? st.seq[st.i];
  return { layout, boxRef: box, indicatorRef: indicator, tableRef: table };
}
