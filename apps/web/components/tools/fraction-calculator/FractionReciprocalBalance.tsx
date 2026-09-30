"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #14 (Balance Indicator): the live fraction B and its reciprocal — multiplying any nonzero fraction by its own reciprocal always lands exactly on 1, the real identity this calculator's own division operation relies on. */
export default function FractionReciprocalBalance() {
  const t = useTranslations("tools.fraction-calculator.education.reciprocalBalance");
  const { dims } = useFractionLive();
  if (dims.numeratorB === 0 || dims.denominatorB === 0) return null;

  const check = tool.execute({ operation: "multiply", numeratorA: dims.numeratorB, denominatorA: dims.denominatorB, numeratorB: dims.denominatorB, denominatorB: dims.numeratorB }, { locale: "en-US" });
  if (!check.success || check.data.error) return null;

  const decB = Math.abs(dims.numeratorB / dims.denominatorB);
  const decRecip = Math.abs(dims.denominatorB / dims.numeratorB);
  const total = decB + decRecip || 1;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-rose-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${(decB / total) * 100}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${(decRecip / total) * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-rose-700 dark:text-rose-400">{`B = ${dims.numeratorB}/${dims.denominatorB}`}</span>
          <span className="text-blue-700 dark:text-blue-400">{`1/B = ${dims.denominatorB}/${dims.numeratorB}`}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "B", value: `${round3(decB)}` },
            { label: "1/B", value: `${round3(decRecip)}` },
            { label: t("worked.product"), value: `${check.data.result.numerator}/${check.data.result.denominator}`, emphasize: true, note: t("worked.alwaysOne") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
