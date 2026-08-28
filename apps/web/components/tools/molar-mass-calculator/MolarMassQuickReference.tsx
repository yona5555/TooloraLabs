"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const EXAMPLES = ["H2O", "NaCl", "C6H12O6", "Ca(OH)2", "CuSO4·5H2O"];

export default function MolarMassQuickReference() {
  const t = useTranslations("tools.molar-mass-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((formula) => (
          <span key={formula} className="rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-sm dark:border-zinc-700">
            {formula}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("syntaxHint")}</p>
    </SectionCard>
  );
}
