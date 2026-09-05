"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function DueDateQuickReference() {
  const t = useTranslations("tools.due-date-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Due date (LMP) = LMP + 280 days</p>
        <p>Due date (conception) = Conception + 266 days</p>
        <p>Due date (IVF transfer) = Transfer + 266 − embryo age</p>
      </div>
    </SectionCard>
  );
}
