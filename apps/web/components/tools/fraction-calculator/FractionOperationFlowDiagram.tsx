"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();
const OP_SYMBOL: Record<string, string> = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

/** Type #2 (Flow Arrow with Embedded Numbers): whichever operation is actually selected above the fold right now — the one indicator on this page whose own shape (not just its numbers) changes with the operation selector, not only with A and B. */
export default function FractionOperationFlowDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.operationFlow");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: dims.operation, numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { result, decimal } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { operation: t(`opNames.${dims.operation}`) })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-base text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{`${dims.numeratorA}/${dims.denominatorA}`}</div>
        <span className="text-lg font-bold text-zinc-500">{OP_SYMBOL[dims.operation]}</span>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-mono text-base text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{`${dims.numeratorB}/${dims.denominatorB}`}</div>
        <ArrowRight className="shrink-0 text-zinc-400" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-base font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">{`${result.numerator}/${result.denominator}`}</div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.operation"), value: t(`opNames.${dims.operation}`) },
            { label: t("worked.decimal"), value: `${Math.round(decimal * 1000) / 1000}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
