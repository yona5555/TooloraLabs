"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function MTQuickReference() {
  const t = useTranslations("tools.multiplication-table-generator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
    </SectionCard>
  );
}
