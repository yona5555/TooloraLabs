"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  sortedValues: number[];
  mean: number;
  median: number;
  digitStyle: DigitStyle;
};

const WIDTH = 320;
const HEIGHT = 80;
const PAD = 20;

/**
 * A dot plot of the actual data set on a number line, with the mean and median marked
 * above it — makes visible how skewed data pulls the mean away from the median, rather
 * than just stating the two numbers side by side.
 */
export default function MeanMedianModeRangeDiagram({ sortedValues, mean, median, digitStyle }: Props) {
  const t = useTranslations("tools.mean-median-mode-range-calculator.diagram");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (sortedValues.length === 0) return null;

  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const span = max - min || 1;
  const scaleX = (v: number) => PAD + ((v - min) / span) * (WIDTH - PAD * 2);

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${t("ariaLabel")}: ${t("mean")}=${fmt(mean)}, ${t("median")}=${fmt(median)}`}
        className="mx-auto block w-full max-w-[360px]"
      >
        <line x1={PAD} y1={HEIGHT - 20} x2={WIDTH - PAD} y2={HEIGHT - 20} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-700" />

        {sortedValues.map((v, i) => (
          <circle key={i} cx={scaleX(v)} cy={HEIGHT - 20} r={4} className="fill-blue-500/70 dark:fill-blue-400/70" />
        ))}

        <g transform={`translate(${scaleX(median)}, 0)`}>
          <line x1={0} y1={8} x2={0} y2={HEIGHT - 20} strokeWidth={2} strokeDasharray="3 2" className="stroke-emerald-600 dark:stroke-emerald-400" />
          <text x={0} y={8} fontSize={11} fontWeight={700} textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300">
            {t("median")}
          </text>
        </g>

        <g transform={`translate(${scaleX(mean)}, 0)`}>
          <line x1={0} y1={8} x2={0} y2={HEIGHT - 20} strokeWidth={2} className="stroke-blue-700 dark:stroke-blue-300" />
          <polygon points="-5,3 5,3 0,10" className="fill-blue-700 dark:fill-blue-300" />
        </g>
      </svg>
      <div className="mt-1 flex justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-700 dark:bg-blue-300" />
          {t("mean")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          {t("median")}
        </span>
      </div>
    </div>
  );
}
