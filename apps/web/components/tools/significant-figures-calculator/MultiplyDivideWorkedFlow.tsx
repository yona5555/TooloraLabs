"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SignificantFiguresCalculator } from "@tooloralabs/tools";

const tool = new SignificantFiguresCalculator();
const A = "4.52";
const B = "3.2";

/** Type #2 (Flow Arrow with Embedded Numbers): multiplication uses the SIG-FIG-COUNT rule instead — the result is limited by whichever original number has the fewest significant figures, not decimal places. */
export default function MultiplyDivideWorkedFlow() {
  const t = useTranslations("tools.significant-figures-calculator.education.multiplyDivide");
  const output = tool.execute({ operation: "multiply", rawValueA: A, rawValueB: B, roundToDigits: 0 }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { sigFigsA, sigFigsB, rawResult, roundedResult, resultSigFigs } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{`${A} × ${B}`}</p>
          <p className="text-xs text-zinc-400">{t("problemLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">{`${rawResult}`}</p>
          <p className="text-xs text-blue-500/80">{t("rawLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">{`${roundedResult}`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: `${A}`, value: t("worked.sigFigs", { count: sigFigsA }) },
            { label: `${B}`, value: t("worked.sigFigs", { count: sigFigsB ?? 0 }) },
            { label: t("worked.limitedBy"), value: `${B} (${sigFigsB ?? 0} sf)` },
            { label: t("worked.result"), value: `${roundedResult}`, emphasize: true, note: t("worked.resultNote", { count: resultSigFigs ?? 0 }) },
          ]}
        />
      </div>
    </SectionCard>
  );
}
