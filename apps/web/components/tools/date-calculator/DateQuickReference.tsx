"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function DateQuickReference() {
  const t = useTranslations("tools.date-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Difference = |End Date − Start Date|</p>
        <p>Result Date = Start Date ± Amount (in chosen unit)</p>
      </div>
    </SectionCard>
  );
}
