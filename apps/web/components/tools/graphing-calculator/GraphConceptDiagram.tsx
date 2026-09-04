"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 480;
const VIEW_H = 280;
const ORIGIN_X = 90;
const ORIGIN_Y = 220;

/**
 * Static, illustrative concept diagram — a single fixed example line (not the user's live
 * expression) labeling the three things a graph is actually read for: where it crosses
 * each axis, and how steep it rises between two points (the slope).
 */
export default function GraphConceptDiagram() {
  const d = useTranslations("tools.graphing-calculator.aboveFold.conceptDiagram");

  const x1 = ORIGIN_X + 40;
  const y1 = ORIGIN_Y - 30;
  const x2 = ORIGIN_X + 160;
  const y2 = ORIGIN_Y - 150;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          {/* axes */}
          <line x1={20} y1={ORIGIN_Y} x2={VIEW_W - 20} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
          <line x1={ORIGIN_X} y1={20} x2={ORIGIN_X} y2={VIEW_H - 20} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          {/* the line itself, extended to both axis crossings */}
          <line x1={40} y1={ORIGIN_Y + 45} x2={330} y2={20} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />

          {/* y-intercept */}
          <circle cx={ORIGIN_X} cy={ORIGIN_Y - 60} r={5} className="fill-emerald-600 dark:fill-emerald-300" />
          <text x={ORIGIN_X + 10} y={ORIGIN_Y - 66} fontSize={12} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
            {d("yInterceptLabel")}
          </text>

          {/* x-intercept */}
          <circle cx={ORIGIN_X + 140} cy={ORIGIN_Y} r={5} className="fill-rose-600 dark:fill-rose-300" />
          <text x={ORIGIN_X + 148} y={ORIGIN_Y + 18} fontSize={12} fontWeight={700} className="fill-rose-700 dark:fill-rose-300">
            {d("xInterceptLabel")}
          </text>

          {/* slope triangle between two points on the line */}
          <line x1={x1} y1={y1} x2={x2} y2={y1} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-amber-600 dark:stroke-amber-300" opacity={0.8} />
          <line x1={x2} y1={y1} x2={x2} y2={y2} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-amber-600 dark:stroke-amber-300" opacity={0.8} />
          <text x={(x1 + x2) / 2} y={y1 + 16} fontSize={11} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            Δx
          </text>
          <text x={x2 + 8} y={(y1 + y2) / 2} fontSize={11} className="fill-amber-700 dark:fill-amber-300">
            Δy
          </text>
          <text x={(x1 + x2) / 2} y={y2 - 10} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            {d("slopeLabel")}
          </text>

          <text x={VIEW_W - 24} y={ORIGIN_Y + 14} fontSize={11} textAnchor="end" fill="currentColor" opacity={0.5}>
            x
          </text>
          <text x={ORIGIN_X - 8} y={30} fontSize={11} textAnchor="end" fill="currentColor" opacity={0.5}>
            y
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
