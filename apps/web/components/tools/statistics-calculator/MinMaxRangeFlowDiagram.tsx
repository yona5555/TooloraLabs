"use client";
import { ArrowRight } from "lucide-react";
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

/** Type #2 (Flow Arrow with Embedded Numbers): the live dataset's real maximum minus its real minimum — the simplest possible measure of spread, using only two of the actual data points. */
export default function MinMaxRangeFlowDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.minMaxRange");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { min, max, range } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round2(max)}</p>
          <p className="text-xs text-blue-500/80">{t("maxLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400">−</span>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="font-mono text-lg font-bold text-rose-700 dark:text-rose-300">{round2(min)}</p>
          <p className="text-xs text-rose-500/80">{t("minLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-zinc-400" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round2(range)}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("rangeLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round2(max)} − ${round2(min)} = ${round2(range)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
