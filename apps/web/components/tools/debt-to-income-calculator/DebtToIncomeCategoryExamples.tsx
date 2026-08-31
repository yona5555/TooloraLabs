"use client";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";

/**
 * Static illustrative row for the education intro — three example households at fixed,
 * hand-picked back-end ratios (not tied to the user's live inputs, unlike the above-fold
 * result gauge), meant to make the category thresholds (36/43/50%) visible at a glance.
 * Reuses the same zone/threshold/color construction as DebtToIncomeResult.tsx's live gauge.
 */
const ZONE_STROKE_COLORS: Record<string, string> = {
  healthy: "stroke-green-500 dark:stroke-green-400",
  manageable: "stroke-amber-500 dark:stroke-amber-400",
  high: "stroke-orange-500 dark:stroke-orange-400",
  veryHigh: "stroke-red-500 dark:stroke-red-400",
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  healthy: "text-green-600 dark:text-green-400",
  manageable: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  veryHigh: "text-red-600 dark:text-red-400",
};

const DOMAIN_MAX = 70;

const ZONES = [
  { key: "healthy", from: 0, to: 36, colorClass: ZONE_STROKE_COLORS.healthy },
  { key: "manageable", from: 36, to: 43, colorClass: ZONE_STROKE_COLORS.manageable },
  { key: "high", from: 43, to: 50, colorClass: ZONE_STROKE_COLORS.high },
  { key: "veryHigh", from: 50, to: DOMAIN_MAX, colorClass: ZONE_STROKE_COLORS.veryHigh },
];

const EXAMPLES = [
  { key: "a", letter: "A", ratio: 22, category: "healthy" },
  { key: "b", letter: "B", ratio: 40, category: "manageable" },
  { key: "c", letter: "C", ratio: 55, category: "veryHigh" },
] as const;

export default function DebtToIncomeCategoryExamples() {
  const t = useTranslations("tools.debt-to-income-calculator.education.intro.diagram");
  const tCategory = useTranslations("tools.debt-to-income-calculator.aboveFold.category");

  return (
    <figure className="my-2">
      <div role="group" aria-label={t("chartAriaLabel")} className="flex flex-wrap items-start justify-center gap-6">
        {EXAMPLES.map((example) => (
          <div key={example.key} className="flex flex-col items-center">
            <RatioGauge
              value={example.ratio}
              domainMin={0}
              domainMax={DOMAIN_MAX}
              zones={ZONES}
              valueLabel={`${example.ratio}%`}
              caption={tCategory(example.category)}
              captionColorClass={CATEGORY_TEXT_COLORS[example.category]}
              ticks={[0, 36, 43, 50]}
              tickFormatter={(tick) => `${tick}%`}
            />
            <span className="mt-1 text-sm font-semibold opacity-80">{t("exampleLabel", { letter: example.letter })}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
