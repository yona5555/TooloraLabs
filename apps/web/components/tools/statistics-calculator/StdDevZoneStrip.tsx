"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [50, 55, 48, 62, 51, 58, 47, 53, 60, 49];
const CHECK_VALUE = 62;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #19 (Zone Strip): a real 10-point data set's mean +/- one standard deviation, with a specific value from the set marked to show whether it falls inside or outside that typical range. */
export default function StdDevZoneStrip() {
  const t = useTranslations("tools.statistics-calculator.education.stdDevZone");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, populationStdDev, min, max } = output.data;

  const lowBand = mean - populationStdDev;
  const highBand = mean + populationStdDev;
  const domainMin = Math.min(min, lowBand) - 2;
  const domainMax = Math.max(max, highBand) + 2;
  const pct = (v: number) => ((v - domainMin) / (domainMax - domainMin)) * 100;
  const insideBand = CHECK_VALUE >= lowBand && CHECK_VALUE <= highBand;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="absolute h-full bg-emerald-200 dark:bg-emerald-500/25" style={{ left: `${pct(lowBand)}%`, width: `${pct(highBand) - pct(lowBand)}%` }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 dark:border-zinc-900 dark:bg-white" style={{ left: `${pct(CHECK_VALUE)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{round2(lowBand)}</span>
          <span className="text-emerald-700 dark:text-emerald-400">{round2(mean)}</span>
          <span>{round2(highBand)}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.band"), value: `${round2(lowBand)} – ${round2(highBand)}` },
            { label: `${CHECK_VALUE}`, value: insideBand ? t("worked.inside") : t("worked.outside"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
