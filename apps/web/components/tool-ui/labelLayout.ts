/**
 * Pure label-layout helpers for chart SVGs (no React, usable in server components): estimated label
 * width, wrapping, staggering, thinning and legend packing, so 12px labels never overlap (§39).
 */
/** Rough rendered width of a label (Arimo/Inter average glyph ≈ 0.6em, bold included). */
export const labelW = (text: string, size = 12) => text.length * size * 0.62;

/**
 * A label that is wider than `maxW` px at `size`, broken into two lines at the operator nearest its
 * middle (" × ", " + ", " − ", " = ", then a space); the operator starts the second line. One line
 * when it fits. Used where 12px text would otherwise run past its box or into its neighbour (§39).
 */
export function wrapLabel(text: string, maxW: number, size = 12): string[] {
  if (labelW(text, size) <= maxW) return [text];
  for (const sep of [" × ", " + ", " − ", " = ", " · ", " "]) {
    let best = -1;
    for (let i = text.indexOf(sep); i > 0; i = text.indexOf(sep, i + 1)) if (best < 0 || Math.abs(i - text.length / 2) < Math.abs(best - text.length / 2)) best = i;
    if (best > 0) return [text.slice(0, best), text.slice(best + 1)];
  }
  return [text];
}

/**
 * Row (0 or 1) for each centred tick label at `x` (sorted ascending) of width `w`: a label that would
 * touch the previous one in row 0 drops to row 1 (§39: close cut-offs stay readable side by side).
 */
export function staggerRows(items: { x: number; w: number }[], gap = 6): number[] {
  const end = [-Infinity, -Infinity];
  return items.map(({ x, w }) => {
    const row = x - w / 2 >= end[0] + gap ? 0 : 1;
    end[row] = x + w / 2;
    return row;
  });
}

/**
 * Like `staggerRows`, with as many rows as needed: each centred label (sorted by `x`) takes the first
 * row where it clears that row's last label by `gap` px.
 */
export function laneRows(items: { x: number; w: number }[], gap = 6): number[] {
  const end: number[] = [];
  return items.map(({ x, w }) => {
    let row = end.findIndex((e) => x - w / 2 >= e + gap);
    if (row < 0) row = end.length;
    end[row] = x + w / 2;
    return row;
  });
}

/**
 * Which centred tick labels to draw so none touch (§39: fewer ticks, never smaller text): labels are
 * taken in `order` (indices, most important first; default left to right) and kept only when clear of
 * every label already kept by `gap` px.
 */
export function thinLabels(items: { x: number; w: number }[], gap = 6, order?: number[]): boolean[] {
  const keep = items.map(() => false);
  const kept: { a: number; b: number }[] = [];
  for (const i of order ?? items.map((_, k) => k)) {
    const a = items[i].x - items[i].w / 2;
    const b = items[i].x + items[i].w / 2;
    if (kept.every((k) => a >= k.b + gap || b <= k.a - gap)) {
      keep[i] = true;
      kept.push({ a, b });
    }
  }
  return keep;
}

/**
 * Legend items packed left to right in rows of `width` px (each item `w` px wide, `gap` between):
 * the x offset and row of every item, and the row count, so labels never run into each other (§39)
 * whatever the drawing's width.
 */
export function flowRows(widths: number[], width: number, gap = 12): { at: { x: number; row: number }[]; rows: number } {
  const at: { x: number; row: number }[] = [];
  let x = 0;
  let row = 0;
  for (const w of widths) {
    if (x > 0 && x + w > width) {
      row++;
      x = 0;
    }
    at.push({ x, row });
    x += w + gap;
  }
  return { at, rows: widths.length ? row + 1 : 0 };
}

/**
 * Point labels (a city on a map, a dot on a dial) placed so none touch (§39): each label, in `items`
 * order (most important first), takes the first free spot beside its point — on its preferred side,
 * then the other, then moved up or down a line at a time — that stays inside the `w`×`h` drawing.
 * `lw` is the label width and `lh` its line height in the drawing's units; `x`/`y` the point. Returns
 * the text x, baseline y and anchor of each label. `blocked` boxes (left a, right b, top t, bottom u) are
 * kept clear too (other text in the drawing).
 */
export function placeLabels(
  items: { x: number; y: number; lw: number; lh: number; side?: "start" | "end" }[],
  w: number,
  h: number,
  off = 7,
  blocked: { a: number; b: number; t: number; u: number }[] = [],
): { x: number; y: number; anchor: "start" | "end" }[] {
  const placed: { a: number; b: number; t: number; u: number }[] = [...blocked];
  return items.map((it) => {
    const first = it.side ?? (it.x + off + it.lw <= w ? "start" : "end");
    type Spot = { x: number; y: number; anchor: "start" | "end" };
    let pick: Spot | null = null;
    let fallback: Spot | null = null;
    for (const step of [0, 1, -1, 2, -2, 3, -3]) {
      for (const anchor of [first, first === "start" ? "end" : "start"] as const) {
        const x = anchor === "start" ? it.x + off : it.x - off;
        const y = it.y + it.lh * 0.3 + step * it.lh;
        const box = { a: anchor === "start" ? x : x - it.lw, b: anchor === "start" ? x + it.lw : x, t: y - it.lh * 0.8, u: y + it.lh * 0.2 };
        if (box.a < 0 || box.b > w || box.t < 0 || box.u > h) continue;
        fallback ??= { x, y, anchor };
        if (placed.every((p) => box.a >= p.b + 2 || box.b <= p.a - 2 || box.t >= p.u || box.u <= p.t)) {
          pick = { x, y, anchor };
          placed.push(box);
          break;
        }
      }
      if (pick) break;
    }
    return pick ?? fallback ?? { x: it.x + off, y: it.y + it.lh * 0.3, anchor: "start" };
  });
}
