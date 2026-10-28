/**
 * Shared chart label layout (§39: labels never overlap, never clipped). Pure geometry, no DOM: it works on
 * boxes measured by `useChartLabels` (the glyph ink of real rendered text, never estimated widths), so the
 * same rules hold for every font (Arial, IBM Plex Sans Arabic, Devanagari) and every rendered size.
 *
 * - `overflowOf` / `nextMargins`: margins grown (or shrunk) from how far measured labels stick out of the
 *   drawing, so a chart's plot area always leaves room for its own labels (no hand-tuned paddings).
 * - `padRange`: those pixel margins turned into a data range (Mafs and any chart drawn from a data window).
 * - `pickSide` / `placeBeside` / `clampInto`: a movable label kept inside the drawing, flipping to its other side first.
 * - `thinEvery`: phone label thinning, from measured label size against the tick spacing.
 * - `physicalSide`: start/end resolved for the page direction (RTL-aware anchoring).
 * - `labelUnits` / `stackBands`: label sizes and bands in viewBox units for hand-drawn SVG charts.
 */

/** Gap kept between a label and anything else (another label, a bar, the drawing's edge), in CSS px. */
export const LABEL_GAP = 4;

export type Box = { left: number; right: number; top: number; bottom: number };
export type Margins = { left: number; right: number; top: number; bottom: number };
export const NO_MARGINS: Margins = { left: 0, right: 0, top: 0, bottom: 0 };

const SIDES = ["left", "right", "top", "bottom"] as const;

/**
 * How far the labels reach past each edge of `frame` (positive = clipped by that much, negative = that much
 * room left), over the labels that are at least partly inside it: a label entirely outside is never drawn
 * (e.g. a tick label beyond the visible range), so it does not count.
 */
export function overflowOf(boxes: readonly Box[], frame: Box): Margins {
  const shown = boxes.filter((b) => b.right > frame.left && b.left < frame.right && b.bottom > frame.top && b.top < frame.bottom);
  if (!shown.length) return { left: -Infinity, right: -Infinity, top: -Infinity, bottom: -Infinity };
  return {
    left: Math.max(...shown.map((b) => frame.left - b.left)),
    right: Math.max(...shown.map((b) => b.right - frame.right)),
    top: Math.max(...shown.map((b) => frame.top - b.top)),
    bottom: Math.max(...shown.map((b) => b.bottom - frame.bottom)),
  };
}

/**
 * Margins after one fit step: each side's current margin plus the measured overflow plus `LABEL_GAP`
 * (never below 0), rounded to 0.5px. Returns `cur` itself when nothing moved by 0.5px or more, so a
 * caller can stop as soon as the layout is stable. `growOnly` stops a side from shrinking (used once a fit
 * has run many steps without settling, so it cannot oscillate).
 */
export function nextMargins(cur: Margins, over: Margins, growOnly = false): Margins {
  const next = { ...cur };
  let moved = false;
  for (const s of SIDES) {
    if (!Number.isFinite(over[s])) continue;
    let v = Math.max(0, Math.round((cur[s] + over[s] + LABEL_GAP) * 2) / 2);
    if (growOnly) v = Math.max(v, cur[s]);
    if (Math.abs(v - cur[s]) >= 0.5) {
      next[s] = v;
      moved = true;
    }
  }
  return moved ? next : cur;
}

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

/** A label centred on `at`, `size` px long, moved the least so it stays inside [lo, hi] (centred when it cannot). */
export function clampInto(at: number, size: number, lo: number, hi: number): number {
  const half = size / 2;
  if (hi - lo <= size) return (lo + hi) / 2;
  return Math.min(hi - half, Math.max(lo + half, at));
}

/**
 * Phone label thinning: draw every n-th tick label so labels `labelPx` long (measured) set `spacingPx`
 * apart keep `LABEL_GAP` between them. 1 = every label. The text size never shrinks; only the count drops.
 */
export function thinEvery(spacingPx: number, labelPx: number): number {
  if (!(spacingPx > 0)) return 1;
  return Math.max(1, Math.ceil((labelPx + LABEL_GAP) / spacingPx));
}

/** A logical side ("start" = where reading begins) as the physical side for the page direction. */
export function physicalSide(side: "start" | "end", rtl: boolean): "left" | "right" {
  return (side === "start") !== rtl ? "left" : "right";
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
