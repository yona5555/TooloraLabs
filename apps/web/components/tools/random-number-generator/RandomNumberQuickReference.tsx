"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function RandomNumberQuickReference() {
  const t = useTranslations("tools.random-number-generator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>1–6, 1 result → dice roll</p>
        <p>1–49, 6 results, no duplicates → lottery draw</p>
        <p>1–100, 1 result → coin-flip-style pick</p>
      </div>
    </SectionCard>
  );
}
