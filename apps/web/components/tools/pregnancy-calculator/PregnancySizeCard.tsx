"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { WeekMilestone } from "./types";

type Props = {
  milestone: WeekMilestone;
  digitStyle: DigitStyle;
};

/** A silhouette-style circle scaled roughly to the week's length, paired with the size-comparison name — the signature "your baby is the size of a ___" visual. */
export default function PregnancySizeCard({ milestone, digitStyle }: Props) {
  const t = useTranslations("tools.pregnancy-calculator");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const maxLength = 52;
  const minRadius = 14;
  const maxRadius = 60;
  const radius = minRadius + (Math.min(milestone.lengthCm, maxLength) / maxLength) * (maxRadius - minRadius);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-pink-200 bg-pink-50/50 p-4 text-center dark:border-pink-500/30 dark:bg-pink-500/5">
      <svg viewBox="0 0 140 140" role="img" aria-label={t(`sizeComparisons.${milestone.sizeComparison}`)} className="h-28 w-28">
        <circle cx={70} cy={70} r={radius} className="fill-pink-400/50 stroke-pink-600 dark:fill-pink-400/30 dark:stroke-pink-300" strokeWidth={2} />
      </svg>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("sizeComparisonIntro")}</p>
        <p className="text-lg font-bold text-pink-700 dark:text-pink-300">{t(`sizeComparisons.${milestone.sizeComparison}`)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {fmt(milestone.lengthCm)} cm{milestone.weightG > 0 ? ` · ${fmt(milestone.weightG)} g` : ""}
        </p>
      </div>
    </div>
  );
}
