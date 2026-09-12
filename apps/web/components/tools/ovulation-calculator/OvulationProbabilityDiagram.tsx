"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed, widely-cited conception-probability-by-cycle-day curve (relative to
 * ovulation day 0), distinct from OvulationCycleTimeline (which plots the
 * user's own projected fertile windows across future cycles, not probability
 * within a single cycle).
 */
const DAYS = [-5, -4, -3, -2, -1, 0, 1];
const PROBABILITY_PERCENT = [4, 10, 16, 23, 26, 25, 8];

export default function OvulationProbabilityDiagram() {
  const d = useTranslations("tools.ovulation-calculator.probabilityDiagram");

  const maxP = Math.max(...PROBABILITY_PERCENT);
  const barWidth = 34;
  const gap = 8;
  const chartHeight = 90;
  const width = DAYS.length * (barWidth + gap) - gap;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${chartHeight + 40}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          {DAYS.map((day, i) => {
            const p = PROBABILITY_PERCENT[i];
            const barHeight = (p / maxP) * chartHeight;
            const x = i * (barWidth + gap);
            const isOvulationDay = day === 0;
            return (
              <g key={day}>
                <rect
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className={isOvulationDay ? "fill-pink-600 dark:fill-pink-400" : "fill-pink-400/60 dark:fill-pink-500/50"}
                />
                <text x={x + barWidth / 2} y={chartHeight - barHeight - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                  {p}%
                </text>
                <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fontSize={11} fontWeight={isOvulationDay ? 700 : 400} fill="currentColor" opacity={isOvulationDay ? 1 : 0.75}>
                  {day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
