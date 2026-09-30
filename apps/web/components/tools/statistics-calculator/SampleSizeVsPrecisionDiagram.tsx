"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const SMALL = [4, 8, 6];
const LARGE = [4, 8, 6, 5, 7, 9, 3, 6, 8, 5, 7, 6];

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #1 (Labeled Bar Chart): the gap between population and sample standard deviation for a small (n=3) data set versus a larger (n=12) one — the n-1 correction matters most exactly when data is scarce. */
export default function SampleSizeVsPrecisionDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.sampleSizeEffect");
  const small = tool.execute({ values: SMALL }, { locale: "en-US" });
  const large = tool.execute({ values: LARGE }, { locale: "en-US" });
  if (!small.success || small.data.error || !large.success || large.data.error) return null;

  const smallGapPct = round3(((small.data.sampleStdDev - small.data.populationStdDev) / small.data.populationStdDev) * 100);
  const largeGapPct = round3(((large.data.sampleStdDev - large.data.populationStdDev) / large.data.populationStdDev) * 100);

  const bars = [
    { label: t("smallLabel", { n: SMALL.length }), value: smallGapPct, formatted: `${smallGapPct}%`, highlight: true },
    { label: t("largeLabel", { n: LARGE.length }), value: largeGapPct, formatted: `${largeGapPct}%` },
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
            { label: t("smallLabel", { n: SMALL.length }), value: `σ=${round2(small.data.populationStdDev)}, s=${round2(small.data.sampleStdDev)}`, emphasize: true },
            { label: t("largeLabel", { n: LARGE.length }), value: `σ=${round2(large.data.populationStdDev)}, s=${round2(large.data.sampleStdDev)}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
