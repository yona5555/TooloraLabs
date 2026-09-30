"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #5 (Ranked Horizontal Bar List): a live x value shows how the calculator's three logarithm bases — 10, e, and 2 — rank a single number differently, each computed via the real logBase/ln/log10 operations. Self-contained, since logarithms have no natural relationship to the hero's angle. */
export default function LogComparisonBarList() {
  const t = useTranslations("tools.scientific-calculator.education.logComparison");
  const [x, setX] = useState(50);

  const log10 = tool.execute({ operation: "log10", a: x }, { locale: "en-US" });
  const ln = tool.execute({ operation: "ln", a: x }, { locale: "en-US" });
  const log2 = tool.execute({ operation: "logBase", a: x, b: 2 }, { locale: "en-US" });
  if (!log10.success || !ln.success || !log2.success) return null;

  const rows = [
    { key: "log10", label: t("log10Label"), value: round3(log10.data.result) },
    { key: "ln", label: t("lnLabel"), value: round3(ln.data.result) },
    { key: "log2", label: t("log2Label"), value: round3(log2.data.result) },
  ].sort((a, b) => b.value - a.value);
  const bars = rows.map((r, i) => ({ label: r.label, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm">
        <input type="range" min={1} max={200} step={1} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("sliderLabel")} />
        <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`x = ${x}`}</p>
      </div>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: r.label, value: `${r.value}` }))} />
      </div>
    </SectionCard>
  );
}
