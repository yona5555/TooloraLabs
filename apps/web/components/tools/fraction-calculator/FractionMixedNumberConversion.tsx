"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NUM = 17;
const DEN = 5;

/** Type #18 (Formula Diagram): converting an improper fraction to a mixed number — how many whole DENs fit into NUM (the whole-number part), with whatever's left over as the remaining fraction. */
export default function FractionMixedNumberConversion() {
  const t = useTranslations("tools.fraction-calculator.education.mixedNumber");
  const whole = Math.trunc(NUM / DEN);
  const remainder = NUM - whole * DEN;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${NUM}/${DEN}`}</p>
          <p className="text-xs text-zinc-400">{t("improperLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${NUM} ÷ ${DEN} = ${whole} r ${remainder}`}</p>
          <p className="text-xs text-blue-500/80">{t("divideLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`${whole} ${remainder}/${DEN}`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("mixedLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.wholePart"), value: `⌊${NUM}/${DEN}⌋ = ${whole}` },
            { label: t("worked.remainder"), value: `${NUM} − ${whole}×${DEN} = ${remainder}` },
            { label: t("worked.result"), value: `${whole} ${remainder}/${DEN}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
