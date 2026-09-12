"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * The Ebbinghaus forgetting curve, with review points marking how spaced
 * repetition resets retention — distinct from PomodoroTimelineDiagram
 * (which shows work/break structure within one session, not retention
 * over days).
 */
const CURVE_POINTS = [
  { day: 0, retention: 100 },
  { day: 1, retention: 55 },
  { day: 2, retention: 40 },
  { day: 6, retention: 25 },
  { day: 14, retention: 18 },
  { day: 30, retention: 10 },
];
const REVIEW_DAYS = [1, 6, 14];

export default function RetentionCurveDiagram() {
  const d = useTranslations("tools.study-time-calculator.retentionDiagram");

  const width = 340;
  const height = 130;
  const padLeft = 32;
  const padBottom = 22;
  const plotW = width - padLeft - 10;
  const plotH = height - padBottom - 10;
  const maxDay = 30;
  const xFor = (day: number) => padLeft + (day / maxDay) * plotW;
  const yFor = (retention: number) => 10 + plotH - (retention / 100) * plotH;

  const points = CURVE_POINTS.map((p) => `${xFor(p.day)},${yFor(p.retention)}`).join(" ");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <line x1={padLeft} y1={10} x2={padLeft} y2={height - padBottom} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
          <line x1={padLeft} y1={height - padBottom} x2={width - 10} y2={height - padBottom} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
          <text x={padLeft - 6} y={16} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            100%
          </text>
          <text x={padLeft - 6} y={height - padBottom} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            0%
          </text>
          <polyline points={points} fill="none" stroke="currentColor" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth={2.5} />
          {CURVE_POINTS.map((p) => (
            <circle key={p.day} cx={xFor(p.day)} cy={yFor(p.retention)} r={3.5} className="fill-blue-500 dark:fill-blue-400" />
          ))}
          {REVIEW_DAYS.map((day) => (
            <line
              key={day}
              x1={xFor(day)}
              y1={10}
              x2={xFor(day)}
              y2={height - padBottom}
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              className="stroke-green-600 dark:stroke-green-400"
              strokeWidth={1.5}
            />
          ))}
          <text x={width - 10} y={22} textAnchor="end" fontSize={10} fontWeight={700} className="fill-green-600 dark:fill-green-400">
            {d("reviewLabel")}
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
