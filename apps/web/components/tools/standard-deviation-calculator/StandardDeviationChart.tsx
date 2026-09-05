"use client";
import { useTranslations } from "next-intl";

type Props = {
  values: number[];
  mean: number;
  populationStdDev: number;
};

const WIDTH = 400;
const HEIGHT = 70;
const PAD = 16;

/**
 * A live number-line plot of the actual entered values, with the mean and a shaded ±1
 * population-standard-deviation band drawn from the real computed result — not a fixed
 * illustration — so the visual spread of dots against that band is the answer, not just the
 * two numbers beside it.
 */
export default function StandardDeviationChart({ values, mean, populationStdDev }: Props) {
  const t = useTranslations("tools.standard-deviation-calculator.chart");

  if (values.length === 0) return null;

  const min = Math.min(...values, mean - populationStdDev);
  const max = Math.max(...values, mean + populationStdDev);
  const domainMin = min - (max - min || 1) * 0.1;
  const domainMax = max + (max - min || 1) * 0.1;

  const scaleX = (v: number) => PAD + ((v - domainMin) / (domainMax - domainMin || 1)) * (WIDTH - PAD * 2);

  const bandX1 = scaleX(mean - populationStdDev);
  const bandX2 = scaleX(mean + populationStdDev);
  const meanX = scaleX(mean);

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("ariaLabel")} className="w-full">
        <rect x={bandX1} y={20} width={Math.max(bandX2 - bandX1, 1)} height={20} className="fill-blue-500/15" />
        <line x1={meanX} y1={12} x2={meanX} y2={48} strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />

        {values.map((v, i) => (
          <circle key={i} cx={scaleX(v)} cy={30} r={4} className="fill-zinc-700 dark:fill-zinc-300" opacity={0.75} />
        ))}

        <line x1={PAD} y1={55} x2={WIDTH - PAD} y2={55} strokeWidth={1} className="stroke-zinc-300 dark:stroke-zinc-700" />
      </svg>
      <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />
          {t("legendValues")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-blue-500/40" />
          {t("legendBand")}
        </span>
      </div>
    </div>
  );
}
