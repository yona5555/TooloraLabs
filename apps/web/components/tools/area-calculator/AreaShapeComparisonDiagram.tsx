"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const SIDE = 10;
const SQUARE_AREA = SIDE * SIDE;
const CIRCLE_AREA = Math.PI * (SIDE / 2) ** 2;
const TRIANGLE_HEIGHT = (Math.sqrt(3) / 2) * SIDE;
const TRIANGLE_AREA = (Math.sqrt(3) / 4) * SIDE ** 2;

const BOX = 110;
/** Every shape is drawn at the same px-per-unit scale (not a shared bounding box) so their real relative sizes — including the triangle's shorter true height — are visible, not just their area labels. */
const PX_PER_UNIT = (BOX - 10) / SIDE;

/**
 * Static "same characteristic width" comparison — a square, circle, and
 * equilateral triangle all sized to the same 10-unit width, drawn to scale
 * with their REAL computed areas (using this tool's own area formulas) —
 * directly shows how shape, not just size, determines area. Distinct from
 * AreaConceptDiagram (which explains what each formula measures) and
 * AreaLiveShape (the user's own live current shape).
 */
export default function AreaShapeComparisonDiagram() {
  const d = useTranslations("tools.area-calculator.shapeComparisonDiagram");

  const fmt = (n: number) => n.toFixed(2);

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro", { side: SIDE })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-end justify-around gap-6">
        <div className="flex flex-col items-center gap-2">
          <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
            <rect x={5} y={5} width={BOX - 10} height={BOX - 10} className="fill-blue-500/80 stroke-blue-700 dark:fill-blue-400/70 dark:stroke-blue-300" strokeWidth={2} />
          </svg>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{d("square")}</span>
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(SQUARE_AREA)} {d("unitsSquared")}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
            <circle cx={BOX / 2} cy={BOX / 2} r={(BOX - 10) / 2} className="fill-amber-500/80 stroke-amber-700 dark:fill-amber-400/70 dark:stroke-amber-300" strokeWidth={2} />
          </svg>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{d("circle")}</span>
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(CIRCLE_AREA)} {d("unitsSquared")}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
            {(() => {
              const triH = TRIANGLE_HEIGHT * PX_PER_UNIT;
              const triW = SIDE * PX_PER_UNIT;
              const baseY = BOX - 5;
              const left = (BOX - triW) / 2;
              return (
                <polygon
                  points={`${BOX / 2},${baseY - triH} ${left + triW},${baseY} ${left},${baseY}`}
                  className="fill-emerald-500/80 stroke-emerald-700 dark:fill-emerald-400/70 dark:stroke-emerald-300"
                  strokeWidth={2}
                />
              );
            })()}
          </svg>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{d("triangle")}</span>
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(TRIANGLE_AREA)} {d("unitsSquared")}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{d("caption")}</p>
    </SectionCard>
  );
}
