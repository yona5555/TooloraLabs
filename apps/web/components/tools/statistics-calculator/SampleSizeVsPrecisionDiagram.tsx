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

/** Type #19 (Zone Strip): how much the live dataset's own sample standard deviation is inflated above its population standard deviation — Bessel's correction, and how that gap genuinely shrinks as the real sample size n grows. */
export default function SampleSizeVsPrecisionDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.sampleSizePrecision");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length < 2) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { count, populationStdDev, sampleStdDev } = output.data;
  const inflationPct = round3(((sampleStdDev - populationStdDev) / populationStdDev) * 100);
  const pct = Math.min(100, (1 / count) * 300);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { n: count })}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>{t("zones.smallN")}</span>
            <span>{t("zones.largeN")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.populationStdDev"), value: `${round3(populationStdDev)}` },
            { label: t("worked.sampleStdDev"), value: `${round3(sampleStdDev)}` },
            { label: t("worked.inflation"), value: `+${inflationPct}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
