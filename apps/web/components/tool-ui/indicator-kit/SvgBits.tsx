"use client";
import { SvgChem } from "./CardKit";
import { niceCeil } from "./format";
export { flowRows, labelW, staggerRows, thinLabels, wrapLabel } from "@/components/tool-ui/labelLayout";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * Small SVG building blocks shared by the 2D indicator cards: a token-coloured label, collision-free
 * axis ticks (§39). The measured drawing box with its drag handle (§40) is in `Drawing.tsx`, so a page that
 * only needs these pure bits never loads the chart label layer (`FitSvg`).
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
