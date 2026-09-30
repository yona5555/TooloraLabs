"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const DATASETS: { key: string; values: number[] }[] = [
  { key: "a", values: [10, 10, 11, 9, 10] },
  { key: "b", values: [5, 10, 15, 8, 12] },
  { key: "c", values: [1, 19, 2, 18, 10] },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #5 (Ranked Horizontal Bar List): three real data sets that could share a similar mean, ranked by their actual standard deviation — proving the mean alone never tells you how spread out the data really is. */
export default function DataSpreadRankedComparison() {
  const t = useTranslations("tools.statistics-calculator.education.spreadRanked");

  const rows = DATASETS.map((d) => {
    const output = tool.execute({ values: d.values }, { locale: "en-US" });
    if (!output.success || output.data.error) return null;
    return { key: d.key, label: t(`sets.${d.key}`), stdDev: round2(output.data.populationStdDev), mean: round2(output.data.mean) };
  })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.stdDev - a.stdDev);

  const bars = rows.map((r, i) => ({ label: r.label, value: r.stdDev, formatted: `${r.stdDev}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: r.label, value: `${t("worked.mean")} ${r.mean}, ${t("worked.stdDev")} ${r.stdDev}` }))} />
      </div>
    </SectionCard>
  );
}
