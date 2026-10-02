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

/** Type #14 (Balance Indicator): the live dataset's real mean and median positioned on the same number line — when they're close, the distribution is roughly symmetric; the further apart, the more skewed it actually is. */
export default function SkewedVsSymmetricComparison() {
  const t = useTranslations("tools.statistics-calculator.education.skewedVsSymmetric");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, median, min, max } = output.data;
  const range = max - min || 1;
  const meanPct = ((mean - min) / range) * 100;
  const medianPct = ((median - min) / range) * 100;
  const gap = Math.abs(mean - median);
  const skewed = gap > 0.05 * range;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${meanPct}%` }} />
            <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${medianPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-sm font-semibold">
            <span className="text-blue-700 dark:text-blue-400">{`${t("meanLabel")}: ${round2(mean)}`}</span>
            <span className="text-emerald-700 dark:text-emerald-400">{`${t("medianLabel")}: ${round2(median)}`}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.gap"), value: `${round2(gap)}` },
            { label: t("worked.shape"), value: skewed ? t("worked.skewed") : t("worked.symmetric"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
