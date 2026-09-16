"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function SWQuickReference() {
  const t = useTranslations("tools.speech-word-count-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Speaking time = word count ÷ words per minute</p>
      </div>
      <dl dir="ltr" className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="flex items-center justify-between gap-3">
          <dt>{t("paceFormal")}</dt>
          <dd className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">110 WPM</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>{t("paceNormal")}</dt>
          <dd className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">140 WPM</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>{t("paceFast")}</dt>
          <dd className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">170 WPM</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
