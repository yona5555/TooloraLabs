"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const FRACTIONS = [
  { n: 1, d: 2 },
  { n: 2, d: 3 },
  { n: 3, d: 8 },
  { n: 5, d: 6 },
];

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #5 (Ranked Horizontal Bar List): four fractions with different denominators, ranked by actual value — impossible to compare at a glance from their numerators/denominators alone, but immediate once each is converted to its decimal position. */
export default function FractionComparisonBarList() {
  const t = useTranslations("tools.fraction-calculator.education.comparison");

  const rows = FRACTIONS.map((f) => ({ ...f, value: round3(f.n / f.d) })).sort((a, b) => b.value - a.value);
  const bars = rows.map((r, i) => ({ label: `${r.n}/${r.d}`, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={rows.map((r, i) => ({ label: `${r.n}/${r.d}`, value: `${r.value}`, emphasize: i === 0, note: i === 0 ? t("worked.largestNote") : undefined }))}
        />
      </div>
    </SectionCard>
  );
}
