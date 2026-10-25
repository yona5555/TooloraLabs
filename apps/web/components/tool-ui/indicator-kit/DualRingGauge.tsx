"use client";
import type { ReactNode } from "react";
import type { Stepper } from "./CardKit";
import { Drawing, INK, px2, SvgLabel as T, useDrawing } from "./SvgBits";

/**
 * The approved double-ring gauge (first drawn for the US vs UK gallon card): two concentric rings
 * filled to the same fraction of one quantity, each ring carrying the tick marks of its own unit,
 * a circular drag handle on the outer ring and the value in both units in the centre. The value
 * pill and the − / + / reset buttons are the card's KitControls, driven by the same Stepper.
 */
export type GaugeRing = {
  /** Tick positions as fractions of the full turn (0..1). */
  ticks: number[];
  /** Arc colour (a theme token). */
  color: string;
  /** Tick colour (a theme token). */
  tickColor: string;
  /** Hover key shared with the worked-example table row (thicker ticks while hovered). */
  hoverKey?: string;
};

export function DualRingGauge({
  s,
  frac,
  innerFrac,
  fromFrac,
  outer,
  inner,
  center,
  hover = null,
  onHover,
  label,
  valueText,
  testId,
  hMin = 270,
  children,
}: {
  s: Stepper;
  /** Fill of both rings (0..1). */
  frac: number;
  /** Optional separate fill of the inner ring (0..1), when the two rings measure different things. */
  innerFrac?: number;
  /** Maps a fraction of the turn back to the Stepper's value (drag). */
  fromFrac: (f: number) => number;
  outer: GaugeRing;
  inner: GaugeRing;
  /** Three centre lines: the quantity, then the outer unit, then the inner unit. */
  center: [string, string, string];
  hover?: string | null;
  onHover?: (k: string | null) => void;
  label: string;
  valueText: string;
  testId: string;
  hMin?: number;
  children?: ReactNode;
}) {
  const d = useDrawing(hMin, s, (x, y, W, H) => {
    let a = Math.atan2(x - W * 0.5, -(y - H / 2));
    if (a < 0) a += 2 * Math.PI;
    return fromFrac(a / (2 * Math.PI));
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W / 2 - 20, H / 2 - 14);
  const r2 = R - 30;
  const f = Math.max(0, Math.min(1, frac));
  const fi = innerFrac === undefined ? f : Math.max(0, Math.min(1, innerFrac));
  const pt = (fr: number, r: number) => [px2(cx + r * Math.sin(fr * 2 * Math.PI)), px2(cy - r * Math.cos(fr * 2 * Math.PI))] as const;
  const arc = (r: number, fr0: number) => {
    const fr = Math.min(fr0, 0.9999);
    const [x, y] = pt(fr, r);
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${fr > 0.5 ? 1 : 0} 1 ${x} ${y}`;
  };
  const tickRing = (ring: GaugeRing, r: number, key: string) =>
    ring.ticks.map((tf, i) => {
      const [a, b] = pt(tf, r - 9);
      const [p, q] = pt(tf, r + 9);
      const on = hover !== null && hover === ring.hoverKey;
      return <line key={`${key}${i}`} x1={a} y1={b} x2={p} y2={q} style={{ stroke: ring.tickColor }} strokeWidth={on ? 3 : 2} strokeLinecap="round" />;
    });
  const [hx, hy] = pt(f, R);
  // Numbers and units read left to right even on an RTL page.
  return (
    <div dir="ltr" className="flex w-full flex-1 flex-col">
    <Drawing {...d} hMin={hMin} label={label} valueText={valueText} handle={{ x: hx, y: hy, dir: "circular" }} s={s} testId={testId}>
      <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r2} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={12} />
      {f > 0.001 && <path d={arc(R, f)} fill="none" style={{ stroke: outer.color }} strokeWidth={12} strokeLinecap="round" />}
      {fi > 0.001 && <path d={arc(r2, fi)} fill="none" style={{ stroke: inner.color }} strokeWidth={12} strokeLinecap="round" />}
      <g onPointerEnter={() => onHover?.(outer.hoverKey ?? null)} onPointerLeave={() => onHover?.(null)}>{tickRing(outer, R, "o")}</g>
      <g onPointerEnter={() => onHover?.(inner.hoverKey ?? null)} onPointerLeave={() => onHover?.(null)}>{tickRing(inner, r2, "i")}</g>
      <T x={cx} y={cy - 14} text={center[0]} size={15} bold style={INK} />
      <T x={cx} y={cy + 6} text={center[1]} size={12} bold style={{ fill: outer.color }} />
      <T x={cx} y={cy + 23} text={center[2]} size={12} bold style={{ fill: inner.color }} />
      {children}
    </Drawing>
    </div>
  );
}

/** Tick fractions for every whole multiple of `per` within a turn worth `max` (gallon-card style). */
export function evenTicks(per: number, max: number): number[] {
  return Array.from({ length: Math.floor(max / per + 1e-9) }, (_, i) => ((i + 1) * per) / max);
}
