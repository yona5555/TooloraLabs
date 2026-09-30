"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const READINGS = ["7.5", "7.50", "7.500", "7.5000"];

/** Type #5 (Ranked Horizontal Bar List): four readings of the same physical quantity from four different instruments, ranked by how many significant figures each one actually reports — more digits after the same value means a more precise instrument, not a "more correct" one. */
export default function PrecisionRankedComparison() {
  const t = useTranslations("tools.significant-figures-calculator.education.precisionRanked");

  const rows = READINGS.map((r) => ({ label: r, count: countSignificantFigures(r) })).sort((a, b) => b.count - a.count);
  const bars = rows.map((r, i) => ({ label: r.label, value: r.count, formatted: `${r.count}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={rows.map((r, i) => ({ label: r.label, value: t("worked.count", { count: r.count }), emphasize: i === 0, note: i === 0 ? t("worked.mostPrecise") : undefined }))}
        />
      </div>
    </SectionCard>
  );
}
