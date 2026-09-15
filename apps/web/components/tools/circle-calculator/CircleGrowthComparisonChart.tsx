"use client";
import { useTranslations } from "next-intl";

/**
 * Fixed illustrative chart (radius 0 to 10, arbitrary units) plotting both of
 * this tool's core outputs — circumference (2πr, linear in r) and area (πr²,
 * quadratic in r) — normalized to their own values at r=10 so both curves
 * share one 0-100% axis. This is the direct visual answer to "why does area
 * grow so much faster than circumference as a circle gets bigger?", a
 * relationship neither CirclePiUnrollDiagram (circumference only) nor
 * CircleAreaDiagram (area only) shows on its own.
 */
const STEPS = 21; // r = 0, 0.5, 1, ..., 10
const R_MAX = 10;

const WIDTH = 300;
const HEIGHT = 160;
const MARGIN = { top: 10, right: 10, bottom: 22, left: 10 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function x(r: number) {
  return MARGIN.left + (r / R_MAX) * PLOT_W;
}
function y(pct: number) {
  return MARGIN.top + PLOT_H - (pct / 100) * PLOT_H;
}

export default function CircleGrowthComparisonChart() {
  const t = useTranslations("tools.circle-calculator.growthChart");

  const points = Array.from({ length: STEPS }, (_, i) => (i / (STEPS - 1)) * R_MAX);
  const circumferenceMax = 2 * Math.PI * R_MAX;
  const areaMax = Math.PI * R_MAX * R_MAX;

  const circumferencePath = points
    .map((r, i) => `${i === 0 ? "M" : "L"} ${x(r)} ${y(((2 * Math.PI * r) / circumferenceMax) * 100)}`)
    .join(" ");
  const areaPath = points
    .map((r, i) => `${i === 0 ? "M" : "L"} ${x(r)} ${y(((Math.PI * r * r) / areaMax) * 100)}`)
    .join(" ");

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto max-w-sm overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("chartAriaLabel")} className="block text-current">
          <line x1={MARGIN.left} y1={y(0)} x2={WIDTH - MARGIN.right} y2={y(0)} stroke="currentColor" strokeWidth={1} opacity={0.25} />
          <path d={circumferencePath} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
          <path d={areaPath} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth={2.5} />
          <text x={x(R_MAX) - 4} y={y(0) - 4} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.7}>
            {t("radiusLabel", { r: R_MAX })}
          </text>
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {t("legendCircumference")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {t("legendArea")}
        </span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
