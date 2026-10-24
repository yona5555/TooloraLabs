"use client";
import { useContext, useRef, type ReactNode } from "react";
import type { HandleDirection } from "@/components/tool-ui/glass/GlassPrimitives";
import { SvgChem, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "./CardKit";
import { niceCeil } from "./format";
import { MiniContext } from "./miniContext";

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

export function SvgLabel({ x, y, text, anchor = "middle", size = 11.5, bold, style = MUTED }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; size?: number; bold?: boolean; style?: { fill: string } }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={bold ? 800 : 600} textAnchor={anchor} style={style} className="tabular-nums">
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
