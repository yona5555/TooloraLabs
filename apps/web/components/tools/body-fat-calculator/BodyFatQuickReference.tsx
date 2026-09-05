"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function BodyFatQuickReference() {
  const t = useTranslations("tools.body-fat-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Men: 86.01×log₁₀(waist−neck) − 70.041×log₁₀(height) + 36.76</p>
        <p>Women: 163.205×log₁₀(waist+hip−neck) − 97.684×log₁₀(height) − 78.387</p>
      </div>
    </SectionCard>
  );
}
