"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #5 (Ranked Horizontal Bar List): the live A and B fractions ranked by decimal size — which one is actually bigger changes live as either fraction is edited. */
export default function FractionComparisonBarList() {
  const t = useTranslations("tools.fraction-calculator.education.comparison");
  const { dims } = useFractionLive();
  const aOut = tool.execute({ operation: "add", numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: 0, denominatorB: 1 }, { locale: "en-US" });
  const bOut = tool.execute({ operation: "add", numeratorA: dims.numeratorB, denominatorA: dims.denominatorB, numeratorB: 0, denominatorB: 1 }, { locale: "en-US" });
  if (!aOut.success || aOut.data.error || !bOut.success || bOut.data.error) return null;

  const rows = [
    { key: "a", label: "A", value: round3(aOut.data.decimal), fraction: `${dims.numeratorA}/${dims.denominatorA}` },
    { key: "b", label: "B", value: round3(bOut.data.decimal), fraction: `${dims.numeratorB}/${dims.denominatorB}` },
  ].sort((x, y) => y.value - x.value);
  const bars = rows.map((r, i) => ({ label: `${r.label} (${r.fraction})`, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: `${r.label} = ${r.fraction}`, value: `${r.value}` }))} />
      </div>
    </SectionCard>
  );
}
