"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ISSUE_TYPES, TYPE_COLOR } from "./sgMath";

export default function SGQuickReference() {
  const t = useTranslations("tools.spelling-grammar-checker.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      {/* Same colours as the Results card's lanes and highlights. */}
      <div className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {ISSUE_TYPES.map((type) => (
          <p key={type} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[type] }} /> {t(`legend.${type}`)}
          </p>
        ))}
      </div>
    </SectionCard>
  );
}
