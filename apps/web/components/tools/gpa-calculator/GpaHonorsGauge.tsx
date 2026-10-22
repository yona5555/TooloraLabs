"use client";
import type { GpaScaleDef } from "@tooloralabs/tools";
import { HONOR_COLORS } from "./planner";

type Props = {
  scale: GpaScaleDef;
  cumulative: number;
  semester: number;
  target: number;
  valueLabel: string;
  semesterLabel: string;
  targetLabel: string;
};

const W = 260;
const H = 168;
const CX = W / 2;
const CY = 132;
const R = 104;
const STROKE = 18;

/**
 * Animated semicircular GPA gauge on the selected scale: honors zones (official thresholds),
 * a needle that eases to the cumulative GPA, a tick for this semester's GPA and a dashed tick
 * for the target. Numbers only inside the SVG; words live in the HTML caption.
 */
export default function GpaHonorsGauge({ scale, cumulative, semester, target, valueLabel, semesterLabel, targetLabel }: Props) {
  const lo = scale.min;
  const span = scale.max - scale.min;
  const frac = (v: number) => Math.min(1, Math.max(0, (v - lo) / span));
  const pt = (v: number, r: number) => {
    const a = Math.PI - frac(v) * Math.PI;
    return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const;
  };
  const arc = (from: number, to: number) => {
    const [x1, y1] = pt(from, R);
    const [x2, y2] = pt(to, R);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };

  // Zones from the top honor down to the scale minimum.
  const bounds = [scale.max, ...scale.honors.map((h) => h.min), lo];
  const zones = bounds.slice(0, -1).map((top, i) => ({ from: bounds[i + 1], to: top, color: HONOR_COLORS[i] ?? "#a1a1aa", honor: i < scale.honors.length }));
  const ticks = [lo, ...scale.honors.map((h) => h.min).reverse(), scale.max];

  const marker = (v: number, dashed: boolean, color: string) => {
    const [x1, y1] = pt(v, R - STROKE / 2 - 4);
    const [x2, y2] = pt(v, R + STROKE / 2 + 4);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeDasharray={dashed ? "3 2" : undefined} strokeLinecap="round" />;
  };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={valueLabel} style={{ direction: "ltr" }} overflow="visible" className="mx-auto block max-h-[300px]">
      {zones.map((z, i) => (
        <path key={i} d={arc(z.from, z.to)} stroke={z.honor ? z.color : "currentColor"} strokeOpacity={z.honor ? 0.9 : 0.15} strokeWidth={STROKE} fill="none" />
      ))}
      {ticks.map((v) => {
        const [x, y] = pt(v, R + STROKE / 2 + 12);
        return (
          <text key={v} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {v.toFixed(2)}
          </text>
        );
      })}
      {marker(semester, false, "#f59e0b")}
      {marker(target, true, "#ef4444")}
      <g style={{ transform: `rotate(${frac(cumulative) * 180}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 700ms cubic-bezier(.34,1.4,.64,1)" }}>
        <line x1={CX} y1={CY} x2={CX - R + 14} y2={CY} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      </g>
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 30} textAnchor="middle" fontSize={26} fontWeight={800} className="fill-blue-700 dark:fill-blue-300">
        {valueLabel}
      </text>
      <text x={CX} y={CY - 12} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        / {scale.max.toFixed(2)}
      </text>
      <g fontSize={10} fontWeight={600}>
        <rect x={8} y={H - 14} width={10} height={4} fill="#f59e0b" />
        <text x={22} y={H - 9} className="fill-zinc-600 dark:fill-zinc-300">{semesterLabel}</text>
        <rect x={W / 2 + 10} y={H - 14} width={10} height={4} fill="#ef4444" />
        <text x={W / 2 + 24} y={H - 9} className="fill-zinc-600 dark:fill-zinc-300">{targetLabel}</text>
      </g>
    </svg>
  );
}
