"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function MTQuickReference() {
  const t = useTranslations("tools.multiplication-table-generator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-center font-mono text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200">
        7 × 8 = 56 &nbsp;=&nbsp; 8 × 7
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("commutativeNote")}</p>
    </SectionCard>
  );
}
