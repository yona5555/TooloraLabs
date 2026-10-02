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

/** Type #16 (Side-by-Side Comparison Cards): the live dataset's real mean, with and without its own most extreme value removed — the mean shifts exactly as much as that one point actually pulls it. */
export default function OutlierEffectOnMeanDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.outlierEffect");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length < 3) return null;
  const withOutlier = tool.execute({ values }, { locale: "en-US" });
  if (!withOutlier.success || withOutlier.data.error) return null;

  const mean = withOutlier.data.mean;
  const furthestIndex = values.reduce((best, v, i) => (Math.abs(v - mean) > Math.abs(values[best] - mean) ? i : best), 0);
  const outlierValue = values[furthestIndex];
  const without = values.filter((_, i) => i !== furthestIndex);
  const withoutOutlier = tool.execute({ values: without }, { locale: "en-US" });
  if (!withoutOutlier.success || withoutOutlier.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: round2(outlierValue) })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("withLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{round2(mean)}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("withoutLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round2(withoutOutlier.data.mean)}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.shift"), value: `${round2(Math.abs(mean - withoutOutlier.data.mean))}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
