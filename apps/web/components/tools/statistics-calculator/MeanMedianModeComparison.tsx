"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [2, 3, 3, 4, 5, 5, 5, 22];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): the three measures of central tendency for a genuinely skewed data set — a single outlier (22) drags the mean well above where most of the data actually sits, while the median and mode stay put. */
export default function MeanMedianModeComparison() {
  const t = useTranslations("tools.statistics-calculator.education.centralTendency");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, median, mode } = output.data;

  const cards = [
    { key: "mean", value: round2(mean) },
    { key: "median", value: round2(median) },
    { key: "mode", value: mode.length ? mode.join(", ") : t("noMode") },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { values: VALUES.join(", ") })}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`${c.key}Label`)}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
