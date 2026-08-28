"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function CitationQuickReference() {
  const t = useTranslations("tools.citation-generator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <li><span className="font-semibold text-zinc-700 dark:text-zinc-300">APA:</span> {t("apaHint")}</li>
        <li><span className="font-semibold text-zinc-700 dark:text-zinc-300">MLA:</span> {t("mlaHint")}</li>
        <li><span className="font-semibold text-zinc-700 dark:text-zinc-300">Chicago:</span> {t("chicagoHint")}</li>
      </ul>
    </SectionCard>
  );
}
