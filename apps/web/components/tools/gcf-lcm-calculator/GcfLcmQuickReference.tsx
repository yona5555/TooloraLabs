"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function GcfLcmQuickReference() {
  const t = useTranslations("tools.gcf-lcm-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>GCF(12, 18) = 6</p>
        <p>LCM(12, 18) = 36</p>
        <p>GCF(a, b) × LCM(a, b) = a × b</p>
      </div>
    </SectionCard>
  );
}
