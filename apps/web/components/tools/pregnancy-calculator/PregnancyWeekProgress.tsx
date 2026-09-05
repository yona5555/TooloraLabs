"use client";
import { useTranslations } from "next-intl";

const WIDTH = 320;
const HEIGHT = 24;
const TRIMESTER_BOUNDARIES = [13, 27];

type Props = {
  percentComplete: number;
  gestationalAgeWeeks: number;
};

export default function PregnancyWeekProgress({ percentComplete, gestationalAgeWeeks }: Props) {
  const t = useTranslations("tools.pregnancy-calculator.diagram");
  const clamped = Math.min(100, Math.max(0, percentComplete));
  const fillWidth = (clamped / 100) * WIDTH;

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${t("ariaLabel")}: ${gestationalAgeWeeks} ${t("weeksShort")}, ${clamped.toFixed(0)}%`}
        className="w-full"
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
        <rect x={0} y={0} width={fillWidth} height={HEIGHT} rx={6} className="fill-pink-500 dark:fill-pink-400" />
        {TRIMESTER_BOUNDARIES.map((weeks) => (
          <line key={weeks} x1={(weeks / 40) * WIDTH} y1={0} x2={(weeks / 40) * WIDTH} y2={HEIGHT} strokeWidth={2} className="stroke-white dark:stroke-zinc-950" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <span>{t("weekLabel", { week: 0 })}</span>
        <span>{t("weekLabel", { week: 40 })}</span>
      </div>
    </div>
  );
}
