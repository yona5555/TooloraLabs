"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDE = 3;
const COVERAGE_PER_LITER = 10;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #2 (Flow Arrow with Embedded Numbers): a real storage cube's total surface area, divided by a real paint can's coverage rate — the actual reason this calculator exists for people outside a classroom: how much paint to actually buy. */
export default function PaintCoverageFlowDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.paintCoverage");
  const output = tool.execute({ shape: "cube", side: SIDE }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const liters = round2(output.data.surfaceArea / COVERAGE_PER_LITER);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${round2(output.data.surfaceArea)} m²`}</p>
          <p className="text-xs text-zinc-400">{t("areaLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`÷ ${COVERAGE_PER_LITER}`}</p>
          <p className="text-xs text-blue-500/80">{t("coverageLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`${liters} L`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round2(output.data.surfaceArea)} ÷ ${COVERAGE_PER_LITER} = ${liters} L`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
