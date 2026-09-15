"use client";
import { useTranslations } from "next-intl";

type Props = {
  values: number[];
  mean: number;
  populationStdDev: number;
};

const THEORETICAL = [68.3, 95.4, 99.7];
const WIDTH = 320;
const ROW_HEIGHT = 30;
const GAP = 14;
const LABEL_WIDTH = 50;
const TRACK_WIDTH = WIDTH - LABEL_WIDTH;

/**
 * Compares the ACTUAL share of this dataset's own values falling within 1σ/2σ/3σ of the mean
 * against the theoretical 68-95-99.7 empirical-rule percentages — distinct from
 * NormalDistributionDiagram (a fixed illustrative curve, no live data) and StandardDeviationChart
 * (plots individual points, not an aggregate %). Answers "does my data actually follow the normal
 * distribution's empirical rule, or diverge from it" using the real computed mean/SD.
 */
export default function EmpiricalRuleCompareChart({ values, mean, populationStdDev }: Props) {
  const t = useTranslations("tools.standard-deviation-calculator.empiricalCompare");

  if (values.length < 2 || populationStdDev === 0) return null;

  const actual = [1, 2, 3].map((sigma) => {
    const within = values.filter((v) => Math.abs(v - mean) <= sigma * populationStdDev).length;
    return (within / values.length) * 100;
  });

  const height = 3 * (ROW_HEIGHT + GAP) - GAP + 16;

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={t("ariaLabel")} className="mx-auto block w-full max-w-sm">
        {[0, 1, 2].map((i) => {
          const y = i * (ROW_HEIGHT + GAP);
          const theoreticalWidth = (THEORETICAL[i] / 100) * TRACK_WIDTH;
          const actualWidth = (actual[i] / 100) * TRACK_WIDTH;
          return (
            <g key={i}>
              <text x={LABEL_WIDTH - 8} y={y + ROW_HEIGHT / 2 + 4} fontSize={12} fontWeight={600} textAnchor="end" fill="currentColor" opacity={0.7}>
                ±{i + 1}σ
              </text>
              <rect x={LABEL_WIDTH} y={y} width={TRACK_WIDTH} height={ROW_HEIGHT} rx={5} className="fill-zinc-100 dark:fill-zinc-800" />
              <rect x={LABEL_WIDTH} y={y} width={theoreticalWidth} height={ROW_HEIGHT / 2 - 1} rx={3} className="fill-zinc-400 dark:fill-zinc-500" fillOpacity={0.6} />
              <rect
                x={LABEL_WIDTH}
                y={y + ROW_HEIGHT / 2 + 1}
                width={actualWidth}
                height={ROW_HEIGHT / 2 - 1}
                rx={3}
                className="fill-blue-600 dark:fill-blue-400"
              />
              <text x={LABEL_WIDTH + TRACK_WIDTH + 6} y={y + 12} fontSize={10} fill="currentColor" opacity={0.55}>
                {THEORETICAL[i].toFixed(1)}%
              </text>
              <text x={LABEL_WIDTH + TRACK_WIDTH + 6} y={y + ROW_HEIGHT - 4} fontSize={10} fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
                {actual[i].toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
    </div>
  );
}
