"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function PdfMergeSplitReference() {
  const t = useTranslations("tools.pdf-merge-split.reference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl dir="ltr" className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center justify-between gap-3">
          <dt>{t("maxSizeLabel")}</dt>
          <dd className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">25 MB</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>{t("rangeSyntaxLabel")}</dt>
          <dd className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">1-3,5,7-9</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("rangeSyntaxNote")}</p>
    </SectionCard>
  );
}
