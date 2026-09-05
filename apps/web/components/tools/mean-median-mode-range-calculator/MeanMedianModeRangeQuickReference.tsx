"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function MeanMedianModeRangeQuickReference() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Mean = Sum / Count</p>
        <p>Median = middle value (sorted)</p>
        <p>Mode = most frequent value(s)</p>
        <p>Range = Max − Min</p>
      </div>
    </SectionCard>
  );
}
