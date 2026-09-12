"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * The classic bell curve with the empirical (68-95-99.7) rule shaded in
 * three bands — distinct from CoefficientOfVariationGauge (which compares a
 * live CV% against real-world examples) and StandardDeviationChart (which
 * plots the user's own entered data points). This is a fixed, illustrative
 * standard normal curve.
 */
function bellY(x: number): number {
  return Math.exp(-(x * x) / 2);
}

const WIDTH = 360;
const HEIGHT = 140;
const CENTER_X = WIDTH / 2;
const SCALE_X = 46; // px per standard deviation
const SCALE_Y = 110;

function pathForRange(fromSigma: number, toSigma: number): string {
  const points: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const sigma = fromSigma + ((toSigma - fromSigma) * i) / steps;
    const x = CENTER_X + sigma * SCALE_X;
    const y = HEIGHT - bellY(sigma) * SCALE_Y;
    points.push(`${x},${y}`);
  }
  const baseline = HEIGHT;
  return `M ${CENTER_X + fromSigma * SCALE_X},${baseline} L ${points.join(" L ")} L ${CENTER_X + toSigma * SCALE_X},${baseline} Z`;
}

const BANDS = [
  { from: -1, to: 1, colorClass: "fill-blue-500/70 dark:fill-blue-400/70", pct: "68%" },
  { from: -2, to: -1, colorClass: "fill-blue-500/40 dark:fill-blue-400/40", pct: "27%" },
  { from: 1, to: 2, colorClass: "fill-blue-500/40 dark:fill-blue-400/40", pct: "27%" },
  { from: -3, to: -2, colorClass: "fill-blue-500/20 dark:fill-blue-400/20", pct: "4%" },
  { from: 2, to: 3, colorClass: "fill-blue-500/20 dark:fill-blue-400/20", pct: "4%" },
];

export default function NormalDistributionDiagram() {
  const d = useTranslations("tools.standard-deviation-calculator.normalDiagram");

  const curvePoints = Array.from({ length: 81 }, (_, i) => {
    const sigma = -3 + (i * 6) / 80;
    const x = CENTER_X + sigma * SCALE_X;
    const y = HEIGHT - bellY(sigma) * SCALE_Y;
    return `${x},${y}`;
  }).join(" ");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          {BANDS.map((band, i) => (
            <path key={i} d={pathForRange(band.from, band.to)} className={band.colorClass} />
          ))}
          <polyline points={curvePoints} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
          <line x1={30} y1={HEIGHT} x2={WIDTH - 30} y2={HEIGHT} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} />
          {[-3, -2, -1, 0, 1, 2, 3].map((sigma) => (
            <text key={sigma} x={CENTER_X + sigma * SCALE_X} y={HEIGHT + 18} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75}>
              {sigma === 0 ? "μ" : `${sigma > 0 ? "+" : ""}${sigma}σ`}
            </text>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
