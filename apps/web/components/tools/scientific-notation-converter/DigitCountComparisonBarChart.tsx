"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

function digitsBeforeDecimal(exponent: number): number {
  return exponent >= 0 ? exponent + 1 : 1;
}

/** Type #1 (Labeled Bar Chart): how many real digits the live A and B would need written out in full standard form — exponent alone tells you, without ever writing the number out. */
export default function DigitCountComparisonBarChart() {
  const t = useTranslations("tools.scientific-notation-converter.education.digitCount");
  const { dims } = useScientificNotationLive();
  const exponentA = Math.round(deriveEffectiveA(dims).exponent);

  const digitsA = digitsBeforeDecimal(exponentA);
  const digitsB = digitsBeforeDecimal(Math.round(dims.exponentB));
  const rows = [
    { key: "a", label: "A", value: digitsA, exponent: exponentA },
    { key: "b", label: "B", value: digitsB, exponent: Math.round(dims.exponentB) },
  ].sort((x, y) => y.value - x.value);
  const bars = rows.map((r, i) => ({ label: `${r.label} (10^${r.exponent})`, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: r.label, value: t("worked.digitsCount", { count: r.value }) }))} />
      </div>
    </SectionCard>
  );
}
