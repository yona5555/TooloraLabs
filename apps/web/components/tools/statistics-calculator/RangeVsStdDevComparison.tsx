"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #1 (Labeled Bar Chart): the live dataset's range (max minus min, swung by a single outlier) next to its real standard deviation (every point's own distance from the mean, much steadier). */
export default function RangeVsStdDevComparison() {
  const t = useTranslations("tools.statistics-calculator.education.rangeVsStdDev");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { range, populationStdDev } = output.data;

  const bars = [
    { label: t("rangeLabel"), value: range, formatted: `${round2(range)}`, highlight: range >= populationStdDev },
    { label: t("stdDevLabel"), value: populationStdDev, formatted: `${round2(populationStdDev)}`, highlight: populationStdDev > range },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.range"), value: `${round2(range)}`, note: t("worked.rangeNote") },
            { label: t("worked.stdDev"), value: `${round2(populationStdDev)}`, note: t("worked.stdDevNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
