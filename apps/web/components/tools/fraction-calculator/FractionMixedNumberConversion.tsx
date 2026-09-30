"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

/** Type #13 (Stepped Diagram): the live result's own mixed-number form, straight from the engine's real conversion — genuinely absent when the result isn't an improper fraction, not forced. */
export default function FractionMixedNumberConversion() {
  const t = useTranslations("tools.fraction-calculator.education.mixedNumber");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: dims.operation, numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { result, mixed, isImproper } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      {mixed ? (
        <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-base dark:border-zinc-700 dark:bg-zinc-800/40">{`${result.numerator}/${result.denominator}`}</div>
          <span className="text-zinc-400">=</span>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-lg font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{`${mixed.whole} ${mixed.numerator}/${mixed.denominator}`}</div>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{isImproper ? t("isWholeOnly", { value: `${result.numerator / result.denominator}` }) : t("properAlready", { value: `${result.numerator}/${result.denominator}` })}</p>
      )}
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.improper"), value: `${result.numerator}/${result.denominator}` },
            { label: t("worked.mixed"), value: mixed ? `${mixed.whole} ${mixed.numerator}/${mixed.denominator}` : "—", emphasize: !!mixed },
          ]}
        />
      </div>
    </SectionCard>
  );
}
