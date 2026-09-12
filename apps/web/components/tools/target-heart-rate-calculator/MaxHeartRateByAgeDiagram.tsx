"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed reference line (220 − age) across common ages — distinct from
 * HeartRateZoneChart, which breaks down the user's own single calculated
 * max heart rate into training zones rather than showing how max HR itself
 * changes with age.
 */
const AGES = [20, 30, 40, 50, 60, 70];

export default function MaxHeartRateByAgeDiagram() {
  const d = useTranslations("tools.target-heart-rate-calculator.maxHrByAgeDiagram");

  const maxHRs = AGES.map((age) => 220 - age);
  const width = 340;
  const height = 130;
  const padLeft = 30;
  const padBottom = 24;
  const plotW = width - padLeft - 10;
  const plotH = height - padBottom - 10;
  const minHR = Math.min(...maxHRs);
  const maxHR = Math.max(...maxHRs);
  const xFor = (i: number) => padLeft + (i / (AGES.length - 1)) * plotW;
  const yFor = (hr: number) => 10 + plotH - ((hr - minHR) / (maxHR - minHR)) * plotH;

  const points = AGES.map((age, i) => `${xFor(i)},${yFor(maxHRs[i])}`).join(" ");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <polyline points={points} fill="none" stroke="currentColor" className="stroke-red-500 dark:stroke-red-400" strokeWidth={2.5} />
          {AGES.map((age, i) => (
            <g key={age}>
              <circle cx={xFor(i)} cy={yFor(maxHRs[i])} r={4} className="fill-red-500 dark:fill-red-400" />
              <text x={xFor(i)} y={yFor(maxHRs[i]) - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                {maxHRs[i]}
              </text>
              <text x={xFor(i)} y={height - 6} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75}>
                {age}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
