"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 720;
const VIEW_H = 220;
const TRACK_Y = 110;

/**
 * Static, illustrative concept diagram — a fixed example route with three consecutive
 * checkpoints (0, 5K, 10K) showing the cumulative distance/time reading at each one, and the
 * pace derived for each segment between them (the same subtraction the Multipoint mode
 * performs on real, unequal splits).
 */
export default function PaceConceptDiagram() {
  const d = useTranslations("tools.pace-calculator.aboveFold.conceptDiagram");

  const points = [
    { x: 60, km: "0", time: "0:00" },
    { x: 380, km: "5", time: "25:00" },
    { x: 660, km: "10", time: "56:00" },
  ];

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-2xl text-current">
          <line x1={points[0].x} y1={TRACK_Y} x2={points[2].x} y2={TRACK_Y} strokeWidth={4} strokeLinecap="round" className="stroke-blue-500 dark:stroke-blue-400" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={TRACK_Y} r={9} className="fill-white stroke-blue-600 dark:fill-zinc-900 dark:stroke-blue-300" strokeWidth={3} />
              <text x={p.x} y={TRACK_Y - 22} fontSize={14} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
                {p.km} km
              </text>
              <text x={p.x} y={TRACK_Y + 34} fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
                {p.time}
              </text>
            </g>
          ))}

          <text x={(points[0].x + points[1].x) / 2} y={TRACK_Y + 60} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            5:00 /km
          </text>
          <text x={(points[1].x + points[2].x) / 2} y={TRACK_Y + 60} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            6:12 /km
          </text>

          <text x={VIEW_W / 2} y={26} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.7}>
            {d("caption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
