"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [12, 15, 18, 14, 16];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #11 (Side-by-Side Equivalence): the exact same 5 numbers, variance computed two ways — dividing by n (population) versus n-1 (sample) — a genuinely different divisor that always makes the sample figure larger. */
export default function PopulationVsSampleVarianceEquivalence() {
  const t = useTranslations("tools.statistics-calculator.education.popVsSample");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { populationVariance, sampleVariance, populationStdDev, sampleStdDev, count } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { values: VALUES.join(", ") })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("populationLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`σ² = ${round2(populationVariance)}`}</p>
          <p className="font-mono text-sm text-blue-600/80 dark:text-blue-400/80">{`σ = ${round2(populationStdDev)}`}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("sampleLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`s² = ${round2(sampleVariance)}`}</p>
          <p className="font-mono text-sm text-blue-600/80 dark:text-blue-400/80">{`s = ${round2(sampleStdDev)}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.divisorPop"), value: `n = ${count}` },
            { label: t("worked.divisorSample"), value: `n − 1 = ${count - 1}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
