"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const FORMULA_KEYS = ["idealGasLaw", "gasConstant", "stp"] as const;

export default function GasLawQuickReference() {
  const t = useTranslations("tools.ideal-gas-law-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-3">
        {FORMULA_KEYS.map((key) => (
          <div key={key} className="rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t(`formulas.${key}.label`)}</p>
            <p className="mt-0.5 font-mono text-zinc-600 dark:text-zinc-300">{t(`formulas.${key}.expression`)}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
