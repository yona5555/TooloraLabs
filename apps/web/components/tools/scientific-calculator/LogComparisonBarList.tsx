"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const X = 100;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #5 (Ranked Horizontal Bar List): the same input run through three different logarithm bases, ranked by result — ln (base e), log (base 10), and log base 2, the log family this calculator's ln/log10/logBase keys cover. */
export default function LogComparisonBarList() {
  const t = useTranslations("tools.scientific-calculator.education.functions.logComparison");

  const ln = round3(Math.log(X));
  const log10 = round3(Math.log10(X));
  const log2 = round3(Math.log2(X));

  const rows = [
    { key: "log2", label: t("log2"), value: log2 },
    { key: "ln", label: t("ln"), value: ln },
    { key: "log10", label: t("log10"), value: log10 },
  ].sort((a, b) => b.value - a.value);

  const bars = rows.map((r, i) => ({ label: r.label, value: r.value, formatted: `${r.value}`, highlight: i === rows.length - 1 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { x: X })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.log2"), value: `log₂(${X}) = ${log2}` },
            { label: t("worked.ln"), value: `ln(${X}) = ${ln}` },
            { label: t("worked.log10"), value: `log₁₀(${X}) = ${log10}`, emphasize: true, note: t("worked.log10Note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
