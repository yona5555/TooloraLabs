"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #2 (Flow Arrow with Embedded Numbers): the live fraction A converted to a decimal and then a percent — the same real value, just two other number systems, via the engine's own decimal field. */
export default function FractionDecimalPercentChain() {
  const t = useTranslations("tools.fraction-calculator.education.decimalPercent");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: "add", numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: 0, denominatorB: 1 }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const decimal = round3(output.data.decimal);
  const percent = round3(output.data.decimal * 100);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-base text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{`${dims.numeratorA}/${dims.denominatorA}`}</div>
          <ArrowRight className="shrink-0 text-zinc-400" size={18} />
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-base dark:border-zinc-700 dark:bg-zinc-800/40">{decimal}</div>
          <ArrowRight className="shrink-0 text-zinc-400" size={18} />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-base font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">{`${percent}%`}</div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.decimal"), value: `${decimal}` },
            { label: t("worked.percent"), value: `${percent}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
