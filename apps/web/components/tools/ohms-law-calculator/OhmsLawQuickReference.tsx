"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const FORMULA_KEYS = ["voltage", "current", "resistance", "powerFromVI", "powerFromIR", "powerFromVR"] as const;

export default function OhmsLawQuickReference() {
  const t = useTranslations("tools.ohms-law-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-2">
        {FORMULA_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60"
          >
            <span className="text-zinc-500 dark:text-zinc-400">{t(`formulas.${key}.label`)}</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{t(`formulas.${key}.expression`)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
