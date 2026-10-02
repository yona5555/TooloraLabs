"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

/** Type #2 (Flow Arrow with Embedded Numbers): dividing by the live B fraction really means multiplying by its flipped reciprocal — shown as a real live flow from the original problem to the equivalent multiplication. */
export default function FractionDivisionFlipDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.divisionFlip");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: "divide", numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { result } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-base dark:border-zinc-700 dark:bg-zinc-800/40">{`${dims.numeratorA}/${dims.denominatorA} ÷ ${dims.numeratorB}/${dims.denominatorB}`}</div>
          <ArrowRight className="shrink-0 text-blue-500" size={20} />
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-base text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{`${dims.numeratorA}/${dims.denominatorA} × ${dims.denominatorB}/${dims.numeratorB}`}</div>
          <ArrowRight className="shrink-0 text-blue-500" size={20} />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-base font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">{`${result.numerator}/${result.denominator}`}</div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.reciprocal"), value: `${dims.denominatorB}/${dims.numeratorB}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
