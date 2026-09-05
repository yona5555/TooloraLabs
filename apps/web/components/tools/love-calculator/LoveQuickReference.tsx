"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function LoveQuickReference() {
  const t = useTranslations("tools.love-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <p className="mt-3 text-xs font-semibold text-pink-600 dark:text-pink-400">{t("disclaimer")}</p>
    </SectionCard>
  );
}
