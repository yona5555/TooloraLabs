"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function SleepQuickReference() {
  const t = useTranslations("tools.sleep-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>1 sleep cycle ≈ 90 minutes</p>
        <p>Bedtime = Wake-up − (cycles × 90 min) − fall-asleep time</p>
        <p>Wake-up = Bedtime + fall-asleep time + (cycles × 90 min)</p>
      </div>
    </SectionCard>
  );
}
