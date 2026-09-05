"use client";
import { useTranslations } from "next-intl";
import type { MacroBreakdown } from "./types";

type Props = {
  protein: MacroBreakdown;
  carbs: MacroBreakdown;
  fat: MacroBreakdown;
};

const COLORS = { protein: "#3b82f6", carbs: "#22c55e", fat: "#f59e0b" };
const SIZE = 160;
const RADIUS = 70;
const CENTER = SIZE / 2;

function toSlicePath(startPercent: number, endPercent: number): string {
  const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
  const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2;
  const x1 = CENTER + RADIUS * Math.cos(startAngle);
  const y1 = CENTER + RADIUS * Math.sin(startAngle);
  const x2 = CENTER + RADIUS * Math.cos(endAngle);
  const y2 = CENTER + RADIUS * Math.sin(endAngle);
  const largeArc = endPercent - startPercent > 50 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/** A pie chart of the three macros' share of total calories — the standard, immediately readable way to show a three-part proportion. */
export default function MacroPieChart({ protein, carbs, fat }: Props) {
  const t = useTranslations("tools.macro-calculator");
  let cursor = 0;
  const slices = [
    { key: "protein" as const, percent: protein.percent, color: COLORS.protein },
    { key: "carbs" as const, percent: carbs.percent, color: COLORS.carbs },
    { key: "fat" as const, percent: fat.percent, color: COLORS.fat },
  ].map((slice) => {
    const start = cursor;
    cursor += slice.percent;
    return { ...slice, path: toSlicePath(start, cursor) };
  });

  return (
    <div dir="ltr" className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("diagram.ariaLabel")} className="h-40 w-40">
        {slices.map((slice) => (
          <path key={slice.key} d={slice.path} fill={slice.color} stroke="white" strokeWidth={1.5} className="dark:stroke-zinc-900" />
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.protein }} />
          {t("result.protein")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.carbs }} />
          {t("result.carbs")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.fat }} />
          {t("result.fat")}
        </span>
      </div>
    </div>
  );
}
