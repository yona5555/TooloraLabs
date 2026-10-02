"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

/** Type #13 (Stepped Diagram): addition mechanics on the live A and B fractions — always addition, regardless of the operation currently selected above, since this indicator's whole purpose is explaining that one specific operation. */
export default function FractionAdditionMechanicsDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.additionMechanics");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: "add", numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { commonDenominator, scaledNumeratorA, scaledNumeratorB, result } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center font-mono text-lg">
          <span className="text-blue-700 dark:text-blue-300">{`${dims.numeratorA}/${dims.denominatorA}`}</span>
          <span className="text-zinc-400">+</span>
          <span className="text-rose-700 dark:text-rose-300">{`${dims.numeratorB}/${dims.denominatorB}`}</span>
          <span className="text-zinc-400">=</span>
          <span className="text-zinc-500">{`${scaledNumeratorA}/${commonDenominator}`}</span>
          <span className="text-zinc-400">+</span>
          <span className="text-zinc-500">{`${scaledNumeratorB}/${commonDenominator}`}</span>
          <span className="text-zinc-400">=</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{`${result.numerator}/${result.denominator}`}</span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.commonDenominator"), value: `${commonDenominator}` },
            { label: t("worked.scaledA"), value: `${scaledNumeratorA}/${commonDenominator}` },
            { label: t("worked.scaledB"), value: `${scaledNumeratorB}/${commonDenominator}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
