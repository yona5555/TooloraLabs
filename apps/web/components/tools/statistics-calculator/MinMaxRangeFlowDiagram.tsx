"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [14, 22, 9, 31, 17, 26];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #2 (Flow Arrow with Embedded Numbers): the simplest measure of spread — max minus min — for a real 6-value data set, the number every other spread measure on this page builds on or improves upon. */
export default function MinMaxRangeFlowDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.minMaxRange");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { min, max, range } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { values: VALUES.join(", ") })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{round2(max)}</p>
          <p className="text-xs text-zinc-400">{t("maxLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">−</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{round2(min)}</p>
          <p className="text-xs text-zinc-400">{t("minLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
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
