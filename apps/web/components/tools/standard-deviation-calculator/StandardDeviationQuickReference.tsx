"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function StandardDeviationQuickReference() {
  const t = useTranslations("tools.standard-deviation-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>σ = √(Σ(x − μ)² / N) — population</p>
        <p>s = √(Σ(x − x̄)² / (n − 1)) — sample</p>
      </div>
    </SectionCard>
  );
}
