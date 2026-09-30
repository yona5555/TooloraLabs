"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const STANDARD = "50,000";
const SCIENTIFIC = "5.00×10⁴";

/** Type #11 (Side-by-Side Equivalence): the same real-world quantity, 50,000, written two ways — standard form leaves its precision genuinely unclear, while the scientific-notation form pins it down to exactly 3 significant figures. */
export default function ScientificVsStandardSigFigsEquivalence() {
  const t = useTranslations("tools.significant-figures-calculator.education.sciEquivalence");
  const sciCount = countSignificantFigures("5.00");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{STANDARD}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("standardLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{SCIENTIFIC}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("scientificLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: STANDARD, value: t("worked.unclear") },
            { label: SCIENTIFIC, value: t("worked.count", { count: sciCount }), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
