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

/** Type #2 (Flow Arrow with Embedded Numbers): the live dataset's real sum, divided by its real count — the mean is nothing more than this one division. */
export default function SumToMeanFlowDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.sumToMean");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { sum, count, mean } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{round2(sum)}</p>
          <p className="text-xs text-zinc-400">{t("sumLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`÷ ${count}`}</p>
          <p className="text-xs text-blue-500/80">{t("countLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round2(mean)}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("meanLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round2(sum)} ÷ ${count} = ${round2(mean)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
