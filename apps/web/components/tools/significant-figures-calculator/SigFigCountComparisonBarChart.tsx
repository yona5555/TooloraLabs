"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const VALUES = ["3.0", "3.00", "3.000", "0.003"];

/** Type #1 (Labeled Bar Chart): four numbers that look almost identical at a glance, compared by their real computed significant-figure count — three of them differ only by trailing zeros, yet each carries genuinely different precision. */
export default function SigFigCountComparisonBarChart() {
  const t = useTranslations("tools.significant-figures-calculator.education.countComparison");

  const bars = VALUES.map((v, i) => ({ label: v, value: countSignificantFigures(v), formatted: `${countSignificantFigures(v)}`, highlight: i === 2 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={VALUES.map((v) => ({ label: v, value: t("worked.count", { count: countSignificantFigures(v) }) }))}
        />
      </div>
    </SectionCard>
  );
}
