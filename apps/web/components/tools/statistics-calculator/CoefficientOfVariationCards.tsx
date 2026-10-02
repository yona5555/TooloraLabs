"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): the live dataset's real coefficient of variation — standard deviation as a percentage of the mean, the one spread measure that stays meaningful when comparing datasets on totally different scales. */
export default function CoefficientOfVariationCards() {
  const t = useTranslations("tools.statistics-calculator.education.coefficientOfVariation");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error || output.data.mean === 0) return null;
  const { mean, populationStdDev } = output.data;
  const cv = round2((populationStdDev / Math.abs(mean)) * 100);
  const isLowVariability = cv < 15;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("stdDevLabel")}</p>
          <p className="mt-2 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{round2(populationStdDev)}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("cvLabel")}</p>
          <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${cv}%`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: `${round2(populationStdDev)} ÷ ${round2(mean)} × 100` },
            { label: t("worked.variability"), value: isLowVariability ? t("worked.low") : t("worked.high"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
