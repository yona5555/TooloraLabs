"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [4, 8, 6, 10];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #9 (Timeline with Stations): the real four-station path from raw data to standard deviation — deviations, squared deviations, their average (variance), then a square root — for a small, fully-traceable data set. */
export default function VarianceCalculationSteps() {
  const t = useTranslations("tools.statistics-calculator.education.varianceSteps");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, populationVariance, populationStdDev } = output.data;

  const deviations = VALUES.map((v) => round2(v - mean));
  const squared = deviations.map((d) => round2(d * d));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.deviations")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{deviations.map((d) => (d >= 0 ? `+${d}` : `${d}`)).join(", ")}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.squared")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{squared.join(", ")}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.averaged")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${t("varianceLabel")} = ${round2(populationVariance)}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.rooted")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`σ = ${round2(populationStdDev)}`}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.mean"), value: `${round2(mean)}` }, { label: t("worked.stdDev"), value: `${round2(populationStdDev)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
