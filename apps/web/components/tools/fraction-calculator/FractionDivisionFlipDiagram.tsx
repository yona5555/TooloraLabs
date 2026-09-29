"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { FractionCalculator } from "@tooloralabs/tools";

const tool = new FractionCalculator();
const A = { n: 1, d: 2 };
const B = { n: 1, d: 4 };

/** Type #18 (Formula Diagram): "keep, change, flip" — the actual three-step rule this tool's divide operation runs, with the reciprocal of B substituted in and the problem finishing as a real multiplication. */
export default function FractionDivisionFlipDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.division");
  const output = tool.execute({ operation: "divide", numeratorA: A.n, denominatorA: A.d, numeratorB: B.n, denominatorB: B.d }, { locale: "en-US" });
  if (!output.success) return null;
  const { result } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${A.n}/${A.d} ÷ ${B.n}/${B.d}`}</p>
          <p className="text-xs text-zinc-400">{t("keepLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${A.n}/${A.d} × ${B.d}/${B.n}`}</p>
          <p className="text-xs text-blue-500/80">{t("flipLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`${result.numerator}/${result.denominator}`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.reciprocal"), value: `${B.n}/${B.d} → ${B.d}/${B.n}` },
            { label: t("worked.multiply"), value: `${A.n} × ${B.d} / ${A.d} × ${B.n}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
