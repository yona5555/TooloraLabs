"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function PregnancyQuickReference() {
  const t = useTranslations("tools.pregnancy-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Gestational age = Today − Last Period</p>
        <p>Due date = Last Period + 280 days</p>
        <p>Trimester 1: weeks 0-12, Trimester 2: weeks 13-26, Trimester 3: weeks 27-40</p>
      </div>
    </SectionCard>
  );
}
