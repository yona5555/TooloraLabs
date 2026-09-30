"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [5, 6, 6, 7, 7, 7, 8, 30];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #11 (Side-by-Side Equivalence, contrasted): range only looks at the two most extreme points, so one outlier inflates it dramatically — standard deviation weighs every point, so it grows far less from the same single outlier. */
export default function RangeVsStdDevComparison() {
  const t = useTranslations("tools.statistics-calculator.education.rangeVsStdDev");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { range, populationStdDev, min, max } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { values: VALUES.join(", ") })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <p className="font-mono text-lg font-bold text-red-700 dark:text-red-300">{round2(range)}</p>
          <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">{t("rangeLabel")}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round2(populationStdDev)}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("stdDevLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.range"), value: `${round2(max)} − ${round2(min)} = ${round2(range)}`, note: t("worked.rangeNote") },
            { label: t("worked.stdDev"), value: `${round2(populationStdDev)}`, emphasize: true, note: t("worked.stdDevNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
