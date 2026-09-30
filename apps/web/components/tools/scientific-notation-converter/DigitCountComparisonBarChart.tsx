"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const VALUES = [
  { standard: "602", scientific: "6.02×10²" },
  { standard: "602,000,000", scientific: "6.02×10⁸" },
  { standard: "602,000,000,000,000,000,000,000", scientific: "6.02×10²³" },
];

/** Type #1 (Labeled Bar Chart): character length of the standard-notation string vs. its scientific-notation equivalent, for three real numbers of increasing size — the gap only grows, which is exactly why scientific notation exists. */
export default function DigitCountComparisonBarChart() {
  const t = useTranslations("tools.scientific-notation-converter.education.digitCount");

  const bars = VALUES.flatMap((v, i) => [
    { label: `${t("standardLabel")} ${i + 1}`, value: v.standard.length, formatted: `${v.standard.length}` },
    { label: `${t("scientificLabel")} ${i + 1}`, value: v.scientific.length, formatted: `${v.scientific.length}`, highlight: true },
  ]);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={VALUES.map((v, i) => ({ label: `#${i + 1}`, value: `${v.standard} = ${v.scientific}`, emphasize: i === 2, note: i === 2 ? t("worked.note") : undefined }))}
        />
      </div>
    </SectionCard>
  );
}
