"use client";
import { useContext, useRef, type ReactNode } from "react";
import type { HandleDirection } from "@/components/tool-ui/glass/GlassPrimitives";
import { SvgChem, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "./CardKit";
import { niceCeil } from "./format";
import { MiniContext } from "./miniContext";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * Small SVG building blocks shared by the 2D indicator cards: a token-coloured label, collision-free
 * axis ticks (§39), and the measured drawing box with its drag handle (§40).
 */
export const INK = { fill: "var(--ph-ink)" };
export const MUTED = { fill: "var(--ph-ink-muted)" };
export const LINE = { stroke: "var(--ph-line)" };
/** Hover-linked outline (§42.4): the focus colour when the matching table row is active. */
export const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1.25 });
/** Trig results differ in the last bits between Node and browsers: round so hydration matches. */
export const px2 = (v: number) => Math.round(v * 100) / 100;

export function SvgLabel({ x, y, text, anchor = "middle", size = 12, bold, style = MUTED }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; size?: number; bold?: boolean; style?: { fill: string } }) {
  return (
    // px2: positions often come from log/trig math whose last digits differ between server and browser.
    <text x={px2(x)} y={px2(y)} fontWeight={bold ? 800 : 600} textAnchor={anchor} style={{ ...style, fontSize: svgPx(size) }} className="tabular-nums">
      <SvgChem text={text} />
    </text>
  );
}

/** Tick values on [lo, hi] spaced so labels at least `gap` px apart over `px` never collide. */
export function axisTicks(lo: number, hi: number, px: number, gap: number): number[] {
  const step = niceCeil((hi - lo) / Math.max(1, Math.floor(px / gap)));
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

/** Rough rendered width of a label (Arial/Inter average glyph ≈ 0.6em, bold included). */
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

/** Measured drawing box + drag plumbing: `toValue` maps a pointer (viewBox px) to the card's value. */
export function useDrawing(hMin: number, s: Stepper, toValue: (x: number, y: number, W: number, H: number) => number, w0 = 520) {
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: w0, h: hMin });
  const H = Math.max(hMin, hBox);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x, y) => s.set(toValue(x, y, W, H)));
  return { boxRef: box, svgRef: ref, drag, W, H };
}

export function Drawing({
  boxRef,
  svgRef,
  drag,
  W,
  H,
  hMin,
  label,
  valueText,
  handle,
  s,
  testId,
  children,
}: {
  boxRef: ReturnType<typeof useDrawing>["boxRef"];
  svgRef: ReturnType<typeof useDrawing>["svgRef"];
  drag: ReturnType<typeof useDrawing>["drag"];
  W: number;
  H: number;
  hMin: number;
  label: string;
  valueText: string;
  handle: { x: number; y: number; dir: HandleDirection };
  s: Stepper;
  testId: string;
  children: ReactNode;
}) {
  // Phone top mini card (rule 2): the same drawing, scaled into the chip, without handle or refs.
  if (useContext(MiniContext)) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 block" aria-hidden="true">
        {children}
      </svg>
    );
  }
  return (
    <div ref={boxRef} data-preview="visual" className="relative w-full flex-1" style={{ minHeight: hMin }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {children}
      </svg>
      <SvgHandle x={handle.x} y={handle.y} viewW={W} viewH={H} direction={handle.dir} label={label} valueText={valueText} s={s} drag={drag} testId={`${testId}-handle`} />
    </div>
  );
}
