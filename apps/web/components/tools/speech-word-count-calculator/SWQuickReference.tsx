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
    </SectionCard>
  );
}
