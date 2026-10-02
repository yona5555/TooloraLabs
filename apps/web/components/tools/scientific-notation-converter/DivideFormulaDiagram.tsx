"use client";
import { useTranslations } from "next-intl";
import { ScientificNotationConverter } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const tool = new ScientificNotationConverter();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #18 (Formula Diagram): the live A divided by B — coefficients divide, exponents subtract — always this operation here, regardless of which mode is actually selected above. */
export default function DivideFormulaDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.divideFormula");
  const { dims } = useScientificNotationLive();
  if (dims.coefficientB === 0) return null;
  const a = deriveEffectiveA(dims);
  const output = tool.execute({ operation: "divide", standardValue: 0, coefficientA: a.coefficient, exponentA: a.exponent, coefficientB: dims.coefficientB, exponentB: dims.exponentB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { coefficient, exponent } = output.data.scientific;
  const rawCoefficient = round3(a.coefficient / dims.coefficientB);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center font-mono text-base">
        <span className="text-blue-700 dark:text-blue-300">{`${round3(a.coefficient)} × 10^${a.exponent}`}</span>
        <span className="text-zinc-400">÷</span>
        <span className="text-rose-700 dark:text-rose-300">{`${dims.coefficientB} × 10^${dims.exponentB}`}</span>
        <span className="text-zinc-400">=</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{`${coefficient} × 10^${exponent}`}</span>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.coefficients"), value: `${round3(a.coefficient)} ÷ ${dims.coefficientB} = ${rawCoefficient}` },
            { label: t("worked.exponents"), value: `${a.exponent} − ${dims.exponentB} = ${a.exponent - dims.exponentB}` },
            { label: t("worked.result"), value: `${coefficient} × 10^${exponent}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
