"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { FractionCalculator } from "@tooloralabs/tools";

const tool = new FractionCalculator();
const START = { n: 2, d: 5 };
const WHOLE = 3;

/** Type #2 (Flow Arrow with Embedded Numbers): a fraction scaled by a whole number — 2/5 tripled — the common "scale a recipe/measurement" case, where the whole number is really just N/1 flowing through the same multiply operation as any other fraction. */
export default function FractionOperationFlowDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.operationFlow");
  const output = tool.execute({ operation: "multiply", numeratorA: START.n, denominatorA: START.d, numeratorB: WHOLE, denominatorB: 1 }, { locale: "en-US" });
  if (!output.success) return null;
  const { result, mixed } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{`${START.n}/${START.d}`}</p>
          <p className="text-xs text-zinc-400">{t("startLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={22} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{`× ${WHOLE}`}</p>
          <p className="text-xs text-blue-500/80">{t("scaleLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={22} />
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{`${result.numerator}/${result.denominator}`}</p>
          <p className="text-xs text-zinc-400">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: `${START.n} × ${WHOLE} / ${START.d}` },
            { label: t("worked.improper"), value: `${result.numerator}/${result.denominator}` },
            { label: t("worked.mixed"), value: mixed ? `${mixed.whole} ${mixed.numerator}/${mixed.denominator}` : `${result.numerator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
