"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { ScientificNotationConverter } from "@tooloralabs/tools";

const tool = new ScientificNotationConverter();
const VALUE = 45700000;

/** Type #11 (Side-by-Side Equivalence): the same real number in standard, scientific, and engineering notation — engineering notation restricts the exponent to multiples of 3 so it lines up with named units (kilo-, mega-, giga-), at the cost of a coefficient that can run up to 999. */
export default function EngineeringNotationEquivalence() {
  const t = useTranslations("tools.scientific-notation-converter.education.engineering");
  const output = tool.execute({ operation: "toScientific", standardValue: VALUE, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  if (!output.success) return null;
  const { scientific, engineering } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{VALUE.toLocaleString("en-US")}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("standardLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${scientific.coefficient}×10^${scientific.exponent}`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("scientificLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${engineering.coefficient}×10^${engineering.exponent}`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("engineeringLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.sciExponent"), value: `${scientific.exponent}` },
            { label: t("worked.engExponent"), value: `${engineering.exponent}`, note: t("worked.engNote") },
            { label: t("worked.engCoefficient"), value: `${engineering.coefficient}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
