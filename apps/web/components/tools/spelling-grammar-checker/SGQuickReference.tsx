"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function SGQuickReference() {
  const t = useTranslations("tools.spelling-grammar-checker.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" /> {t("legend.spelling")}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-400" /> {t("legend.grammar")}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> {t("legend.capitalization")}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-400" /> {t("legend.punctuation")}
        </p>
      </div>
    </SectionCard>
  );
}
