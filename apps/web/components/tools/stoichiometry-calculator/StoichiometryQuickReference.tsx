"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function StoichiometryQuickReference() {
  const t = useTranslations("tools.stoichiometry-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
        <p className="font-mono text-zinc-700 dark:text-zinc-200">{t("formula")}</p>
      </div>
    </SectionCard>
  );
}
