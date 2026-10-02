"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Type #13 (Stepped Diagram): the raw, unsimplified fraction the live operation actually produces before reduction — computed from the engine's own scaled numerators and common denominator — followed by the real GCD step down to the final simplified result. */
export default function FractionSimplificationSteps() {
  const t = useTranslations("tools.fraction-calculator.education.simplificationSteps");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: dims.operation, numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { result, commonDenominator, scaledNumeratorA, scaledNumeratorB } = output.data;

  let rawNumerator: number;
  let rawDenominator: number;
  if (dims.operation === "add" && commonDenominator !== null && scaledNumeratorA !== null && scaledNumeratorB !== null) {
    rawNumerator = scaledNumeratorA + scaledNumeratorB;
    rawDenominator = commonDenominator;
  } else if (dims.operation === "subtract" && commonDenominator !== null && scaledNumeratorA !== null && scaledNumeratorB !== null) {
    rawNumerator = scaledNumeratorA - scaledNumeratorB;
    rawDenominator = commonDenominator;
  } else if (dims.operation === "multiply") {
    rawNumerator = dims.numeratorA * dims.numeratorB;
    rawDenominator = dims.denominatorA * dims.denominatorB;
  } else {
    rawNumerator = dims.numeratorA * dims.denominatorB;
    rawDenominator = dims.denominatorA * dims.numeratorB;
  }
  const divisor = gcd(rawNumerator, rawDenominator);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center font-mono text-lg">
          <span className="text-zinc-600 dark:text-zinc-300">{`${rawNumerator}/${rawDenominator}`}</span>
          <span className="text-zinc-400">÷</span>
          <span className="text-blue-600 dark:text-blue-400">{`${divisor}/${divisor}`}</span>
          <span className="text-zinc-400">=</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{`${result.numerator}/${result.denominator}`}</span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.raw"), value: `${rawNumerator}/${rawDenominator}` },
            { label: t("worked.gcd"), value: `${divisor}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true, note: divisor === 1 ? t("worked.alreadySimplified") : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
