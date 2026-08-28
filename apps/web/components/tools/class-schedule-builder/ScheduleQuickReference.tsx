"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function ScheduleQuickReference() {
  const t = useTranslations("tools.class-schedule-builder.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("conflictHint")}</p>
    </SectionCard>
  );
}
