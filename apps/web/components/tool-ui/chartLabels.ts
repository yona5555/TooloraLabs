/**
 * Shared chart label layout (§39: labels never overlap, never clipped). Pure geometry, no DOM: it works on
 * boxes measured by `useChartLabels` (the glyph ink of real rendered text, never estimated widths), so the
 * same rules hold for every font (Arial, IBM Plex Sans Arabic, Devanagari) and every rendered size.
 *
 * - `marginDelta` / `nextMargins`: margins grown (or shrunk) from how far measured labels stick out of the
 *   drawing, so a chart's plot area always leaves room for its own labels (no hand-tuned paddings).
 * - `placeClear` / `clampInto`: an authored label moved the least to clear the measured labels around it.
 * Layout helpers only some charts use are in `chartLayout.ts`, so `FitSvg` does not carry them to every chart.
 */

/** Gap kept between a label and anything else (another label, a bar, the drawing's edge), in CSS px. */
export const LABEL_GAP = 4;

export type Box = { left: number; right: number; top: number; bottom: number };
export type Margins = { left: number; right: number; top: number; bottom: number };
export const NO_MARGINS: Margins = { left: 0, right: 0, top: 0, bottom: 0 };

const SIDES = ["left", "right", "top", "bottom"] as const;

type Side = (typeof SIDES)[number];

/** Per side: how far the label's centre lies inside that edge (`depth`, negative = outside), how far its
 * ink crosses the edge outward (`out`), and how far its ink reaches back inside (`in`). */
const EDGE: Record<Side, (b: Box, f: Box) => { depth: number; out: number; in: number }> = {
  left: (b, f) => ({ depth: (b.left + b.right) / 2 - f.left, out: f.left - b.left, in: b.right - f.left }),
  right: (b, f) => ({ depth: f.right - (b.left + b.right) / 2, out: b.right - f.right, in: f.right - b.left }),
  top: (b, f) => ({ depth: (b.top + b.bottom) / 2 - f.top, out: f.top - b.top, in: b.bottom - f.top }),
  bottom: (b, f) => ({ depth: f.bottom - (b.top + b.bottom) / 2, out: b.bottom - f.bottom, in: f.bottom - b.top }),
};

/**
 * How much each margin must change (px, + grow / − shrink) so that no label is cut by the edge of `frame`,
 * given the current margins `cur`. Only labels whose ink reaches into the drawing count (one entirely
 * outside is never drawn). A label centred inside needs the edge `LABEL_GAP` beyond its ink (grow when it
 * overflows, shrink back to that when it has room). A label centred outside is pulled fully in — except,
 * in a view with its own padding beyond its area of interest (a negative `floor`, e.g. Mafs' padding), a
 * label whose point lies past the area of interest (the next tick past the view, which a wider view keeps
 * bringing in): that one is pushed fully out when that moves the edge less, without cutting an inside label
 * or taking the margin below `floor`. A label of a point inside the area of interest is never pushed out.
 */
export function marginDelta(boxes: readonly Box[], frame: Box, cur: Margins, floor: Margins = NO_MARGINS): Margins {
  const shown = boxes.filter((b) => b.right > frame.left && b.left < frame.right && b.bottom > frame.top && b.top < frame.bottom);
  const delta = { ...NO_MARGINS };
  for (const s of SIDES) {
    const edges = shown.map((b) => EDGE[s](b, frame));
    const inner = edges.filter((e) => e.depth >= 0);
    // the area of interest starts this far inside the edge (the margin plus the padding it may give up)
    const aoi = cur[s] - floor[s];
    // room the inside labels need (negative = room to give back), and never a margin below the floor
    let d = Math.max(floor[s] - cur[s], ...inner.map((e) => e.out + LABEL_GAP));
    if (!inner.length) d = 0;
    for (const e of edges.filter((x) => x.depth < 0)) {
      const pullIn = e.out + LABEL_GAP;
      const pushOut = -(e.in + LABEL_GAP);
      const pastArea = floor[s] < 0 && e.depth < aoi; // its point lies outside the area of interest
      const canPush = pastArea && pushOut >= d - 1e-9 && cur[s] + pushOut >= floor[s];
      d = canPush && -pushOut < pullIn ? pushOut : Math.max(d, pullIn);
    }
    delta[s] = d || 0; // never -0 (Math.max(-0, …))
  }
  return delta;
}

/**
 * Margins after one fit step: `cur` moved by `delta` (never below `floor`), rounded to 0.5px. Returns `cur`
 * itself when nothing moved by 0.5px or more — or when `frozen` (a fit that has run many steps without
 * settling keeps its last layout instead of oscillating) — so a caller can stop as soon as it is stable.
 */
export function nextMargins(cur: Margins, delta: Margins, frozen = false, floor: Margins = NO_MARGINS): Margins {
  if (frozen) return cur;
  const next = { ...cur };
  let moved = false;
  for (const s of SIDES) {
    const v = Math.max(floor[s], Math.round((cur[s] + delta[s]) * 2) / 2);
    if (Math.abs(v - cur[s]) >= 0.5) {
      next[s] = v;
      moved = true;
    }
  }
  return moved ? next : cur;
}

const clear = (a: Box, b: Box) => a.right + LABEL_GAP <= b.left || b.right + LABEL_GAP <= a.left || a.bottom + LABEL_GAP <= b.top || b.bottom + LABEL_GAP <= a.top;
const within = (a: Box, f: Box) => a.left >= f.left + LABEL_GAP && a.right <= f.right - LABEL_GAP && a.top >= f.top + LABEL_GAP && a.bottom <= f.bottom - LABEL_GAP;

/**
 * The least move (dx, dy px) that takes a label `box` clear of every `blocked` box (other labels) by
 * `LABEL_GAP` and inside `frame`: tried in growing steps of one label size (`step`), vertical before
 * horizontal. When nothing is free, the move that keeps it inside the frame.
 */
export function placeClear(box: Box, blocked: readonly Box[], frame: Box, step: { x: number; y: number }): { dx: number; dy: number } {
  const at = (dx: number, dy: number) => ({ left: box.left + dx, right: box.right + dx, top: box.top + dy, bottom: box.bottom + dy });
  const moves: [number, number][] = [[0, 0]];
  for (let k = 1; k <= 4; k++) moves.push([0, -k], [0, k], [-k, 0], [k, 0], [-k, -k], [k, -k], [-k, k], [k, k]);
  for (const [i, j] of moves) {
    const b = at(i * step.x, j * step.y);
    if (within(b, frame) && blocked.every((o) => clear(b, o))) return { dx: i * step.x, dy: j * step.y };
  }
  const w = box.right - box.left;
  const h = box.bottom - box.top;
  return { dx: clampInto((box.left + box.right) / 2, w, frame.left, frame.right) - (box.left + box.right) / 2, dy: clampInto((box.top + box.bottom) / 2, h, frame.top, frame.bottom) - (box.top + box.bottom) / 2 };
}

/** A label centred on `at`, `size` px long, moved the least so it stays inside [lo, hi] (centred when it cannot). */
export function clampInto(at: number, size: number, lo: number, hi: number): number {
  const half = size / 2;
  if (hi - lo <= size) return (lo + hi) / 2;
  return Math.min(hi - half, Math.max(lo + half, at));
}
