"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function ProbabilityQuickReference() {
  const t = useTranslations("tools.probability-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>P(A) = favorable / total</p>
        <p>P(A and B) = P(A) × P(B)</p>
        <p>P(A or B) = P(A) + P(B) − P(A and B)</p>
        <p>P(A | B) = P(A and B) / P(B)</p>
      </div>
    </SectionCard>
  );
}
