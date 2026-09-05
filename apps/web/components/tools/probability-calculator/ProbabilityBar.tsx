"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  percentage: number;
  digitStyle: DigitStyle;
};

const WIDTH = 320;
const HEIGHT = 28;

/**
 * A live horizontal meter of the solved probability, filled from 0% to the actual
 * result — a shared visual across every mode, since single-event, AND, OR, and
 * conditional probability all resolve to the same kind of 0-100% quantity.
 */
export default function ProbabilityBar({ percentage, digitStyle }: Props) {
  const t = useTranslations("tools.probability-calculator.diagram");
  const clamped = Math.min(100, Math.max(0, percentage));
  const fillWidth = (clamped / 100) * WIDTH;
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${t("ariaLabel")}: ${fmt(clamped)}%`} className="w-full">
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
        <rect x={0} y={0} width={fillWidth} height={HEIGHT} rx={6} className="fill-blue-600 dark:fill-blue-500" />
        <text x={WIDTH / 2} y={HEIGHT / 2 + 5} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-zinc-900 mix-blend-difference dark:fill-white">
          {fmt(clamped)}%
        </text>
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
