"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const WITHOUT = [21, 23, 24, 22, 25];
const WITH = [21, 23, 24, 22, 25, 95];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #2 (Flow Arrow with Embedded Numbers): the same five real values, before and after one outlier (95) is added — the mean jumps sharply while the median barely moves, the real reason median is preferred for skewed real-world data (like income). */
export default function OutlierEffectOnMeanDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.outlierEffect");
  const before = tool.execute({ values: WITHOUT }, { locale: "en-US" });
  const after = tool.execute({ values: WITH }, { locale: "en-US" });
  if (!before.success || before.data.error || !after.success || after.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{WITHOUT.join(", ")}</p>
          <p className="mt-1 font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{`${t("meanLabel")} ${round2(before.data.mean)}`}</p>
        </div>
        <ArrowRight className="shrink-0 text-red-500" size={20} />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="font-mono text-sm text-red-500">{`+ 95`}</p>
          <p className="text-xs text-red-500/80">{t("outlierLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-red-500" size={20} />
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{WITH.join(", ")}</p>
          <p className="mt-1 font-mono text-base font-bold text-red-700 dark:text-red-300">{`${t("meanLabel")} ${round2(after.data.mean)}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.meanBefore"), value: `${round2(before.data.mean)}` },
            { label: t("worked.meanAfter"), value: `${round2(after.data.mean)}`, emphasize: true, note: t("worked.meanNote") },
            { label: t("worked.medianBefore"), value: `${round2(before.data.median)}` },
            { label: t("worked.medianAfter"), value: `${round2(after.data.median)}`, note: t("worked.medianNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
