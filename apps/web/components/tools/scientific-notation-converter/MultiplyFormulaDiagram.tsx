"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { ScientificNotationConverter } from "@tooloralabs/tools";

const tool = new ScientificNotationConverter();
const A = { c: 2, e: 3 };
const B = { c: 3, e: 5 };

/** Type #18 (Formula Diagram): multiplying two numbers already in scientific notation — coefficients multiply, exponents add — the actual rule this tool's multiply operation runs. */
export default function MultiplyFormulaDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.multiply");
  const output = tool.execute({ operation: "multiply", standardValue: 0, coefficientA: A.c, exponentA: A.e, coefficientB: B.c, exponentB: B.e }, { locale: "en-US" });
  if (!output.success) return null;
  const { scientific } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{`(${A.c}×10^${A.e}) × (${B.c}×10^${B.e})`}</p>
          <p className="text-xs text-zinc-400">{t("problemLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">{`(${A.c}×${B.c}) × 10^(${A.e}+${B.e})`}</p>
          <p className="text-xs text-blue-500/80">{t("ruleLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">{`${scientific.coefficient}×10^${scientific.exponent}`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.coefficients"), value: `${A.c} × ${B.c} = ${A.c * B.c}` },
            { label: t("worked.exponents"), value: `${A.e} + ${B.e} = ${A.e + B.e}` },
            { label: t("worked.result"), value: `${scientific.coefficient}×10^${scientific.exponent}`, emphasize: true, note: A.c * B.c >= 10 ? t("worked.renormalizedNote", { raw: `${A.c * B.c}×10^${A.e + B.e}` }) : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
