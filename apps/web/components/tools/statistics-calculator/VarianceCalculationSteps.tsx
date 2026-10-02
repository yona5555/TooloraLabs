"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #13 (Stepped Diagram): the live dataset's own population variance, built in three real stations — deviations, squared deviations, and their average. */
export default function VarianceCalculationSteps() {
  const t = useTranslations("tools.statistics-calculator.education.varianceSteps");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, populationVariance, count } = output.data;
  const sumSquaredDeviations = values.reduce((s, v) => s + (v - mean) ** 2, 0);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center font-mono text-sm">
        <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{t("worked.step1Short", { mean: round3(mean) })}</span>
        <span className="text-zinc-300 dark:text-zinc-600">→</span>
        <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{t("worked.step2Short", { sum: round3(sumSquaredDeviations) })}</span>
        <span className="text-zinc-300 dark:text-zinc-600">→</span>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("worked.step3Short", { variance: round3(populationVariance) })}</span>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.sumSquaredDeviations"), value: `${round3(sumSquaredDeviations)}` },
            { label: t("worked.count"), value: `${count}` },
            { label: t("worked.variance"), value: `${round3(populationVariance)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
