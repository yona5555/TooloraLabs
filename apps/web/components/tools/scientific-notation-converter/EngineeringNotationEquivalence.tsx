"use client";
import { useTranslations } from "next-intl";
import { ScientificNotationConverter } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const tool = new ScientificNotationConverter();

/** Type #11 (Side-by-Side Equivalence): the live A, shown in real scientific notation (exponent any integer) next to its real engineering notation (exponent always a multiple of 3, the convention electronics and unit prefixes use). */
export default function EngineeringNotationEquivalence() {
  const t = useTranslations("tools.scientific-notation-converter.education.engineeringEquivalence");
  const { dims } = useScientificNotationLive();
  const a = deriveEffectiveA(dims);
  const output = tool.execute({ operation: "toStandard", standardValue: 0, coefficientA: a.coefficient, exponentA: a.exponent, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { scientific, engineering } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("scientificLabel")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${scientific.coefficient} × 10^${scientific.exponent}`}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("engineeringLabel")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{`${engineering.coefficient} × 10^${engineering.exponent}`}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.rule"), value: t("worked.ruleValue") },
            { label: t("worked.result"), value: `${engineering.coefficient} × 10^${engineering.exponent}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
