"use client";
/**
 * The result's own live visual: a full unit-circle indicator (§38 -- circles/arcs/lines only,
 * never a clipped half-arc or a grid). The ring IS one whole. Part of the hero group (§37.6):
 * reads A/B/operation from the SAME live context the hero and input fields share, and the two
 * draggable hands write straight back into it -- there is no local state here.
 *
 * Three concentric rings read outward: A (red/danger) innermost, B (green/success) middle,
 * the result (violet accent) outermost, each a radius line (the "hand") reaching the rim plus
 * its own thin progress arc at its own radius -- never overlapping because they live at
 * different radii. An improper result (|value|>=1) fills the outer ring completely and uses an
 * extra innermost ring (inside A's) for the remainder, mirroring the hero donut's own
 * whole+remainder idea but in this indicator's own distinct form (a dial, not a donut).
 *
 * Labels: four FIXED cardinal labels (0, 1/4, 1/2, 3/4) sit at 0/90/180/270 degrees regardless of
 * the live denominator -- their positions never depend on live data, so they can never collide no
 * matter what A/B become. Only the three dynamic value+degree labels (A/B/result) depend on live
 * angles; those run through the shared 1D collision helper (§39) before every render. Minor tick
 * marks (unlabeled) are drawn at every 1/denominator step up to a 100-tick render cap -- past
 * that the ring still reads correctly, it just stops drawing individual tick lines (a labelled
 * reading never needed that many marks anyway).
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassHandle, useValueFlash } from "@/components/tool-ui/glass/GlassPrimitives";
import { avoidOverlap1D } from "@/components/tool-ui/glass/glass-label-placement";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue } from "@tooloralabs/tools";

type Props = { numerator: number; denominator: number; caption: string };

// Generous margin between R_RESULT and the viewBox edge: the dynamic (A/B/result) label ring sits
// at LABEL_R2, and CX/CY leave at least that much clearance on every side so no label at any
// angle is ever clipped by the SVG's own viewBox (its default overflow is hidden, so "clipped at
// the bottom" -- the defect this component replaces -- was exactly this margin being too small).
const CX = 150;
const CY = 140;
const R_RESULT = 70;
const R_B = 56;
const R_A = 42;
const R_REMAINDER = 24;
const HAND_INNER_R = 30;
const TICK_OUT = R_RESULT + 6;
const TICK_OUT_MAJOR = R_RESULT + 12;
const LABEL_R = R_RESULT + 24;
const LABEL_R2 = R_RESULT + 48;
const VB_W = 300;
const VB_H = 320;
const STRIP_Y = 272;
const STRIP_X0 = 30;
const STRIP_X1 = 270;

// Rounded to 2dp: an SVG numeric attribute's server-vs-client float serialization can differ in
// the last couple of decimal digits (toString() of a 15-digit double isn't byte-identical across
// Node and the browser's V8 for every value), which React's hydration check treats as a real
// mismatch. Rounding before it ever becomes a JSX attribute removes the discrepancy outright.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function point(angleDeg: number, radius: number, cx = CX, cy = CY) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: round2(cx + radius * Math.sin(rad)), y: round2(cy - radius * Math.cos(rad)) };
}

/** Unsigned position on the dial, 0..1, where the hand points (direction info is separate). */
function unitPosition(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const m = value % 1;
  return m < 0 ? m + 1 : m;
}

/** A ring-aligned progress arc from 0deg to the hand's own angle, clamped to one full turn. */
function ringArcPath(value: number, radius: number): string {
  if (!Number.isFinite(value) || value === 0) return "";
  const negative = value < 0;
  const turns = Math.min(1, Math.abs(value) < 1 ? Math.abs(value) : 1);
  const sweep = turns * 360 * (negative ? -1 : 1);
  const endAngle = negative ? -turns * 360 : turns * 360;
  if (Math.abs(sweep) >= 359.999) {
    // a full circle needs two arc commands (a single SVG arc can't span 360deg)
    const mid = point(negative ? -180 : 180, radius);
    const end = point(0.01 * (negative ? -1 : 1), radius);
    return `M ${point(0, radius).x} ${point(0, radius).y} A ${radius} ${radius} 0 1 ${negative ? 0 : 1} ${mid.x} ${mid.y} A ${radius} ${radius} 0 1 ${negative ? 0 : 1} ${end.x} ${end.y}`;
  }
  const start = point(0, radius);
  const end = point(endAngle, radius);
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = negative ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
}

const CARDINAL = [
  { frac: "0", deg: 0 },
  { frac: "1/4", deg: 90 },
  { frac: "1/2", deg: 180 },
  { frac: "3/4", deg: 270 },
];

export default function FractionResultGauge({ numerator, denominator, caption }: Props) {
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const tCommon = useTranslations("common");
  const { flashing, trigger } = useValueFlash();
  const [draggingHand, setDraggingHand] = useState<"A" | "B" | null>(null);

  const den = denominator || 1;
  const resultValue = Number.isFinite(numerator / den) ? numerator / den : 0;
  const whole = Math.trunc(resultValue);
  const remainder = Math.abs(resultValue - whole);
  const isImproper = Math.abs(resultValue) >= 1;

  const valueA = denominatorA ? numeratorA / denominatorA : 0;
  const valueB = denominatorB ? numeratorB / denominatorB : 0;

  const angleA = unitPosition(valueA) * 360 * (valueA < 0 ? -1 : 1);
  const angleB = unitPosition(valueB) * 360 * (valueB < 0 ? -1 : 1);
  const angleResult = unitPosition(resultValue) * 360 * (resultValue < 0 ? -1 : 1);
  const degA = Math.round(unitPosition(valueA) * 360);
  const degB = Math.round(unitPosition(valueB) * 360);
  const degResult = Math.round(unitPosition(resultValue) * 360);

  // §39: the three dynamic labels run through the shared collision helper against EACH OTHER,
  // but first get nudged off any of the four fixed cardinal angles they happen to land on or
  // near -- the fixed cardinals sit at a smaller radius (own band) so a purely radial gap isn't
  // enough to clear them at a side angle (0/90/180/270), where "radially further out" is almost
  // entirely a WIDTH offset, not a height one, and two centered text blocks only 24px of radius
  // apart there still overlap horizontally. A fixed cardinal never moves, so the dynamic one is
  // the one that must yield.
  const resolvedAngles = useMemo(() => {
    function awayFromCardinals(angle: number): number {
      let a = angle;
      for (const c of CARDINAL) {
        const diff = ((a - c.deg + 540) % 360) - 180;
        if (Math.abs(diff) < 34) a = c.deg + (diff >= 0 ? 34 : -34);
      }
      return a;
    }
    const items = [
      { key: "A", center: awayFromCardinals(angleA), halfWidth: 20 },
      { key: "B", center: awayFromCardinals(angleB), halfWidth: 20 },
      { key: "result", center: awayFromCardinals(angleResult), halfWidth: 20 },
    ];
    return avoidOverlap1D(items, 14);
  }, [angleA, angleB, angleResult]);

  const tickCount = Math.min(100, Math.max(1, Math.round(den)));
  const ticks = useMemo(() => Array.from({ length: tickCount }, (_, i) => (i / tickCount) * 360), [tickCount]);

  function dragHand(which: "A" | "B") {
    return (e: React.PointerEvent<SVGElement>) => {
      const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as unknown as SVGSVGElement);
      const rect = svg.getBoundingClientRect();
      const scale = VB_W / rect.width;
      const px = (e.clientX - rect.left) * scale;
      const py = (e.clientY - rect.top) * scale;
      const angle = (Math.atan2(px - CX, -(py - CY)) * 180) / Math.PI;
      const norm = ((angle % 360) + 360) % 360;
      const den2 = which === "A" ? denominatorA : denominatorB;
      const newNum = Math.round((norm / 360) * (den2 || 1));
      setDim(which === "A" ? "numeratorA" : "numeratorB", newNum);
      trigger();
    };
  }
  function stepHand(which: "A" | "B") {
    return (delta: 1 | -1) => {
      const num = which === "A" ? numeratorA : numeratorB;
      const den2 = which === "A" ? denominatorA : denominatorB;
      setDim(which === "A" ? "numeratorA" : "numeratorB", Math.max(0, Math.min(den2 || 1, num + delta)));
      trigger();
    };
  }

  const tipA = point(angleA, R_RESULT + 2);
  const tipB = point(angleB, R_RESULT + 2);
  const tipResult = point(angleResult, R_RESULT + 2);
  const stripW = STRIP_X1 - STRIP_X0;
  const stripXFor = (deg: number) => round2(STRIP_X0 + unitPosition(deg / 360) * stripW);

  return (
    <figure className="my-2 flex flex-col items-center gap-1">
      <div dir="ltr" className="relative w-full max-w-[320px]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={VB_W}
          height={VB_H}
          role="img"
          aria-label={caption}
          className="h-auto w-full touch-none"
          onPointerMove={(e) => { if (draggingHand) dragHand(draggingHand)(e); }}
          onPointerUp={() => setDraggingHand(null)}
          onPointerLeave={() => setDraggingHand(null)}
        >
          {/* minor ticks (unlabeled, visual texture only) */}
          {ticks.map((deg, i) => {
            const isMajor = CARDINAL.some((c) => Math.abs(c.deg - deg) < 0.01);
            const p1 = point(deg, TICK_OUT - (isMajor ? 10 : 4));
            const p2 = point(deg, isMajor ? TICK_OUT_MAJOR : TICK_OUT);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--glass-border)" strokeWidth={isMajor ? 1.5 : 1} />;
          })}

          {/* fixed cardinal labels -- positions never depend on live data */}
          {CARDINAL.map((c) => {
            const p = point(c.deg, LABEL_R);
            return (
              <text key={c.frac} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill="var(--glass-muted)" data-role="label">
                {c.frac}
              </text>
            );
          })}

          {/* result ring (outermost) -- full ring + inner remainder ring when improper */}
          <circle cx={CX} cy={CY} r={R_RESULT} fill="none" stroke="var(--glass-track)" strokeWidth="6" />
          <path d={isImproper ? ringArcPath(resultValue < 0 ? -1 : 1, R_RESULT) : ringArcPath(resultValue, R_RESULT)} fill="none" stroke="var(--glass-accent-5-strong)" strokeWidth="6" strokeLinecap="round" className="transition-all duration-300 ease-out" data-role="curve" />
          {isImproper && (
            <>
              <circle cx={CX} cy={CY} r={R_REMAINDER} fill="none" stroke="var(--glass-track)" strokeWidth="6" />
              <path d={ringArcPath(remainder * (resultValue < 0 ? -1 : 1), R_REMAINDER)} fill="none" stroke="var(--glass-accent-5-strong)" strokeWidth="6" strokeLinecap="round" opacity="0.7" data-role="curve" />
            </>
          )}

          {/* B ring (middle) */}
          <circle cx={CX} cy={CY} r={R_B} fill="none" stroke="var(--glass-track)" strokeWidth="5" />
          <path d={ringArcPath(valueB, R_B)} fill="none" stroke="var(--glass-success-strong)" strokeWidth="5" strokeLinecap="round" className="transition-all duration-300 ease-out" data-role="curve" />

          {/* A ring (innermost) */}
          <circle cx={CX} cy={CY} r={R_A} fill="none" stroke="var(--glass-track)" strokeWidth="5" />
          <path d={ringArcPath(valueA, R_A)} fill="none" stroke="var(--glass-danger-strong)" strokeWidth="5" strokeLinecap="round" className="transition-all duration-300 ease-out" data-role="curve" />

          {/* hands (radius lines reaching the rim) -- start at a radius clear of the center
              readout's own text block (§39: a hand must never cross behind a label's glyphs,
              which a line literally anchored at the exact center would do whenever its angle
              happened to pass through a gap between characters) */}
          {(() => {
            const base = point(angleResult, HAND_INNER_R);
            const baseB = point(angleB, HAND_INNER_R);
            const baseA = point(angleA, HAND_INNER_R);
            return (
              <>
                <line x1={base.x} y1={base.y} x2={tipResult.x} y2={tipResult.y} stroke="var(--glass-accent-5-strong)" strokeWidth="1.5" opacity="0.6" data-role="mark" />
                <line x1={baseB.x} y1={baseB.y} x2={tipB.x} y2={tipB.y} stroke="var(--glass-success-strong)" strokeWidth="2.5" data-role="mark" />
                <line x1={baseA.x} y1={baseA.y} x2={tipA.x} y2={tipA.y} stroke="var(--glass-danger-strong)" strokeWidth="2.5" data-role="mark" />
              </>
            );
          })()}

          {/* dynamic labels (collision-avoided, own band further out than the fixed cardinals).
              Two short lines (value, then degree) rather than one wide "value · deg" string --
              narrower halves the odds two labels at a close angle overlap horizontally, which is
              exactly the axis a purely radial gap does nothing for at a side angle (§39). */}
          <text x={point(resolvedAngles.A, LABEL_R2).x} y={point(resolvedAngles.A, LABEL_R2).y} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--glass-danger-strong)" data-role="label">
            <tspan x={point(resolvedAngles.A, LABEL_R2).x} dy="-0.3em">{`${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}`}</tspan>
            <tspan x={point(resolvedAngles.A, LABEL_R2).x} dy="1.1em">{`${degA}°`}</tspan>
          </text>
          <text x={point(resolvedAngles.B, LABEL_R2).x} y={point(resolvedAngles.B, LABEL_R2).y} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--glass-success-strong)" data-role="label">
            <tspan x={point(resolvedAngles.B, LABEL_R2).x} dy="-0.3em">{`${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}`}</tspan>
            <tspan x={point(resolvedAngles.B, LABEL_R2).x} dy="1.1em">{`${degB}°`}</tspan>
          </text>
          <text x={point(resolvedAngles.result, LABEL_R2).x} y={point(resolvedAngles.result, LABEL_R2).y} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--glass-accent-5-strong)" data-role="label">
            <tspan x={point(resolvedAngles.result, LABEL_R2).x} dy="-0.3em">{`${formatMathValue(numerator)}/${formatMathValue(den)}`}</tspan>
            <tspan x={point(resolvedAngles.result, LABEL_R2).x} dy="1.1em">{`${degResult}°`}</tspan>
          </text>

          {/* center readout -- §42.3: a brief tinted flash behind the number whenever a hand
              drag changes the result (an SVG <text> has no renderable background of its own,
              so the flash is this sibling rect, not a className on the text itself) */}
          {flashing && <rect x={CX - 26} y={CY - 16} width="52" height="20" rx="4" className="glass-value-flash" />}
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--glass-title)" data-role="label">
            {formatMathValue(numerator)}/{formatMathValue(den)}
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="var(--glass-muted)" data-role="label">
            {`${degResult}°`}
          </text>

          {/* dashed projection lines from each hand's tip down to the unrolled strip */}
          <line x1={tipA.x} y1={tipA.y} x2={stripXFor(degA)} y2={STRIP_Y} stroke="var(--glass-danger-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1={tipB.x} y1={tipB.y} x2={stripXFor(degB)} y2={STRIP_Y} stroke="var(--glass-success-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1={tipResult.x} y1={tipResult.y} x2={stripXFor(degResult)} y2={STRIP_Y} stroke="var(--glass-accent-5-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* the unrolled 0..1 strip -- same ticks, same three markers */}
          <line x1={STRIP_X0} y1={STRIP_Y} x2={STRIP_X1} y2={STRIP_Y} stroke="var(--glass-track)" strokeWidth="4" strokeLinecap="round" />
          {ticks.map((deg, i) => {
            const isMajor = CARDINAL.some((c) => Math.abs(c.deg - deg) < 0.01);
            if (!isMajor && tickCount > 24) return null;
            const x = round2(STRIP_X0 + (deg / 360) * stripW);
            return <line key={`s${i}`} x1={x} y1={STRIP_Y - 5} x2={x} y2={STRIP_Y + 5} stroke="var(--glass-border)" strokeWidth={isMajor ? 1.5 : 1} />;
          })}
          <circle cx={stripXFor(degA)} cy={STRIP_Y} r="5" fill="var(--glass-danger-strong)" stroke="var(--glass-handle-ring)" strokeWidth="1.5" data-role="mark" />
          <circle cx={stripXFor(degB)} cy={STRIP_Y} r="5" fill="var(--glass-success-strong)" stroke="var(--glass-handle-ring)" strokeWidth="1.5" data-role="mark" />
          <circle cx={stripXFor(degResult)} cy={STRIP_Y} r="5" fill="var(--glass-accent-5-strong)" stroke="var(--glass-handle-ring)" strokeWidth="1.5" data-role="mark" />

          {/* invisible larger hit targets so each hand's own hit-circle starts its own drag */}
          <circle
            cx={tipA.x}
            cy={tipA.y}
            r="16"
            fill="transparent"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDraggingHand("A"); dragHand("A")(e); }}
          />
          <circle
            cx={tipB.x}
            cy={tipB.y}
            r="16"
            fill="transparent"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDraggingHand("B"); dragHand("B")(e); }}
          />
        </svg>

        {/* draggable hands (§40): one shared handle, positioned at each hand's rim tip */}
        <GlassHandle direction="circular" ariaLabel={tCommon("dragToChange")} onStep={stepHand("A")} style={{ left: `${(tipA.x / VB_W) * 100}%`, top: `${(tipA.y / VB_H) * 100}%`, transform: "translate(-50%, -50%)" }} />
        <GlassHandle direction="circular" ariaLabel={tCommon("dragToChange")} onStep={stepHand("B")} style={{ left: `${(tipB.x / VB_W) * 100}%`, top: `${(tipB.y / VB_H) * 100}%`, transform: "translate(-50%, -50%)" }} />
      </div>
      <figcaption className="text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
