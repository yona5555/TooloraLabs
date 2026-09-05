"use client";
import { useTranslations } from "next-intl";

const WIDTH = 300;
const HEIGHT = 40;

/** A simple two-point timeline with the span between start and end highlighted — makes the "distance" between two dates visually concrete. */
export default function DateSpanDiagram({ totalDays }: { totalDays: number }) {
  const t = useTranslations("tools.date-calculator.diagram");

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${t("ariaLabel")}: ${totalDays}`} className="w-full">
        <line x1={20} y1={HEIGHT / 2} x2={WIDTH - 20} y2={HEIGHT / 2} strokeWidth={3} className="stroke-blue-500 dark:stroke-blue-400" />
        <circle cx={20} cy={HEIGHT / 2} r={6} className="fill-blue-600 dark:fill-blue-300" />
        <circle cx={WIDTH - 20} cy={HEIGHT / 2} r={6} className="fill-blue-600 dark:fill-blue-300" />
        <text x={20} y={HEIGHT / 2 - 12} fontSize={11} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          {t("start")}
        </text>
        <text x={WIDTH - 20} y={HEIGHT / 2 - 12} fontSize={11} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          {t("end")}
        </text>
      </svg>
    </div>
  );
}
