"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function StudyTimeQuickReference() {
  const t = useTranslations("tools.study-time-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl dir="ltr" className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800/60">
          <dt className="text-zinc-600 dark:text-zinc-300">{t("defaultWork")}</dt>
          <dd className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">25 min</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800/60">
          <dt className="text-zinc-600 dark:text-zinc-300">{t("defaultShortBreak")}</dt>
          <dd className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">5 min</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800/60">
          <dt className="text-zinc-600 dark:text-zinc-300">{t("defaultLongBreak")}</dt>
          <dd className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">15 min</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
