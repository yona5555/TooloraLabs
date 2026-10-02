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

/** Type #11 (Side-by-Side Equivalence): the live dataset's own population variance (divides by n) next to its sample variance (divides by n − 1) — the same squared deviations, two real denominators. */
export default function PopulationVsSampleVarianceEquivalence() {
  const t = useTranslations("tools.statistics-calculator.education.popVsSampleVariance");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length < 2) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { populationVariance, sampleVariance, count } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("populationLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round3(populationVariance)}</p>
          <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">{t("divideBy", { n: count })}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{t("sampleLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round3(sampleVariance)}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("divideBy", { n: count - 1 })}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.difference"), value: `${round3(sampleVariance - populationVariance)}`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}
