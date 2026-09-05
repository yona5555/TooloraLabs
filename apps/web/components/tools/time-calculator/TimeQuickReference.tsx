"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function TimeQuickReference() {
  const t = useTranslations("tools.time-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Total seconds = h×3600 + m×60 + s</p>
        <p>Result = Time 1 ± Time 2 (in total seconds), then converted back to h:m:s</p>
      </div>
    </SectionCard>
  );
}
