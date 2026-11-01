import { LABEL_GAP } from "./chartLabels";

/**
 * Chart layout from measured labels, for the charts that lay themselves out (pure geometry, no DOM):
 * - `padRange`: pixel margins turned into a data range (Mafs and any chart drawn from a data window).
 * - `pickSide` / `placeBeside`: a movable label kept inside the drawing, flipping to its other side first.
 * - `fitStep` / `thinEvery`: a band chart sized to its container, labels thinned from their measured size.
 * - `labelUnits` / `stackBands`: label sizes and bands in viewBox units for hand-drawn SVG charts.
 */

/** The data range [a, b] widened so that `before` and `after` px stay free at its ends over `lengthPx`. */
export function padRange([a, b]: readonly [number, number], lengthPx: number, before: number, after: number): [number, number] {
  const inner = lengthPx - before - after;
  if (!(lengthPx > 0) || !(inner > 0) || !(b > a)) return [a, b];
  const unitsPerPx = (b - a) / inner;
  return [a - before * unitsPerPx, b + after * unitsPerPx];
}

/**
 * Which side of its anchor `at` a label `size` px long goes on, inside [lo, hi]: the `prefer` side when it
 * fits, else the other side when that fits, else the side with more room.
 */
export function pickSide(at: number, size: number, lo: number, hi: number, prefer: "after" | "before", off = LABEL_GAP): "after" | "before" {
  const roomAfter = hi - at - off;
  const roomBefore = at - lo - off;
  const fits = (s: "after" | "before") => (s === "after" ? roomAfter : roomBefore) >= size;
  const other = prefer === "after" ? "before" : "after";
  if (fits(prefer)) return prefer;
  if (fits(other)) return other;
  return roomAfter >= roomBefore ? "after" : "before";
}

/**
 * A label `size` px long set beside its anchor `at` (on `pickSide`'s side, `off` px away), with the anchor
 * moved the least so the whole label stays inside [lo, hi] even when the anchor itself is outside it
 * (e.g. a dragged point's companion past the plot edge). Returns the side and the anchor to draw at.
 */
export function placeBeside(at: number, size: number, lo: number, hi: number, prefer: "after" | "before", off = LABEL_GAP): { side: "after" | "before"; at: number } {
  const side = pickSide(at, size, lo, hi, prefer, off);
  const start = Math.min(hi - size, Math.max(lo, side === "after" ? at + off : at - off - size));
  return { side, at: side === "after" ? start - off : start + size + off };
}

/**
 * Per-item step (px) of a band or bar chart drawn at its container's width: the `room` px the container
 * gives, less `reserved` px of margins, shared by `n` items, so the chart never runs past its card (no
 * horizontal scroll box hiding the last labels). `fallback` before the container is measured (server).
 */
export function fitStep(room: number, reserved: number, n: number, fallback: number): number {
  return room > 0 && n > 0 ? Math.max(0, (room - reserved) / n) : fallback;
}

/**
 * Phone label thinning: draw every n-th tick label so labels `labelPx` long (measured) set `spacingPx`
 * apart keep `LABEL_GAP` between them. 1 = every label. The text size never shrinks; only the count drops.
 */
export function thinEvery(spacingPx: number, labelPx: number): number {
  if (!(spacingPx > 0)) return 1;
  return Math.max(1, Math.ceil((labelPx + LABEL_GAP) / spacingPx));
}

/**
 * Font size in viewBox units of a label written with `svgPx(n)`: `n`, but never less than 12 rendered px,
 * i.e. 12 × `k` (k = viewBox units per rendered px, the `--svg-k` that `svgPx` reads).
 */
export function labelUnits(n: number, k: number): number {
  return Math.max(n, 12 * k);
}

export type Band = { ascent: number; descent: number };

/**
 * Bands stacked down a drawing `height` units tall: a header label row, a free plot band, a footer label row,
 * each label row sized by its measured ascent + descent and kept `gap` units from its neighbours.
 * Returns the header baseline, the footer baseline and the plot band [top, bottom] between them.
 */
export function stackBands(height: number, header: Band, footer: Band, gap: number) {
  const headerBase = gap + header.ascent;
  const footerBase = height - gap - footer.descent;
  return { headerBase, footerBase, plotTop: headerBase + header.descent + gap, plotBottom: footerBase - footer.ascent - gap };
}
