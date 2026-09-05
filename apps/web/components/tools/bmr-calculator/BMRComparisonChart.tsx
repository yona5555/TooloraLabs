"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  harrisBenedict: number;
  mifflinStJeor: number;
  digitStyle: DigitStyle;
};

const WIDTH = 280;
const BAR_HEIGHT = 22;
const GAP = 10;

/** A simple two-bar comparison scaled to the larger of the two values — makes the (often small) gap between the two historical formulas visible at a glance. */
export default function BMRComparisonChart({ harrisBenedict, mifflinStJeor, digitStyle }: Props) {
  const t = useTranslations("tools.bmr-calculator");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const maxValue = Math.max(harrisBenedict, mifflinStJeor, 1);
  const scale = (value: number) => (value / maxValue) * WIDTH;

  const bars = [
    { key: "harrisBenedict" as const, value: harrisBenedict, color: "#3b82f6" },
    { key: "mifflinStJeor" as const, value: mifflinStJeor, color: "#22c55e" },
  ];

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${BAR_HEIGHT * 2 + GAP}`} role="img" aria-label={t("diagram.ariaLabel")} className="w-full">
        {bars.map((bar, i) => (
          <g key={bar.key} transform={`translate(0, ${i * (BAR_HEIGHT + GAP)})`}>
            <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
            <rect x={0} y={0} width={scale(bar.value)} height={BAR_HEIGHT} rx={4} fill={bar.color} />
            <text x={8} y={BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} className="fill-white">
              {fmt(bar.value)} kcal
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
          {t("formulas.labels.harrisBenedict")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
          {t("formulas.labels.mifflinStJeor")}
        </span>
      </div>
    </div>
  );
}
