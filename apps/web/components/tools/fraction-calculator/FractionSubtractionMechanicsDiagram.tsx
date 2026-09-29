"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { FractionCalculator } from "@tooloralabs/tools";

const tool = new FractionCalculator();
const A = { n: 3, d: 4 };
const B = { n: 1, d: 6 };

/** Type #9 (Timeline with Stations): the same three-station mechanic as addition, run through subtract instead — 3/4 − 1/6, where the LCD (12) differs from either original denominator, making the rescale step do real work. */
export default function FractionSubtractionMechanicsDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.subtraction");
  const output = tool.execute({ operation: "subtract", numeratorA: A.n, denominatorA: A.d, numeratorB: B.n, denominatorB: B.d }, { locale: "en-US" });
  if (!output.success) return null;
  const { commonDenominator, scaledNumeratorA, scaledNumeratorB, result } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-32 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.original")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${A.n}/${A.d} − ${B.n}/${B.d}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-32 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.rescaled")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${scaledNumeratorA}/${commonDenominator} − ${scaledNumeratorB}/${commonDenominator}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-32 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.combined")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${result.numerator}/${result.denominator}`}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.lcd"), value: `${commonDenominator}` },
            { label: t("worked.why"), value: `lcm(${A.d}, ${B.d}) = ${commonDenominator}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
