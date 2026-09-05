"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function MacroQuickReference() {
  const t = useTranslations("tools.macro-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Protein &amp; Carbs = 4 kcal/g</p>
        <p>Fat = 9 kcal/g</p>
        <p>Grams = (Total Calories × Macro %) / kcal per gram</p>
      </div>
    </SectionCard>
  );
}
