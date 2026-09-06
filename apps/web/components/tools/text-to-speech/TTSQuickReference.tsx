"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function TTSQuickReference() {
  const t = useTranslations("tools.text-to-speech.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Rate: 0.5x-2x (default 1x)</p>
        <p>Pitch: 0-2 (default 1)</p>
      </div>
    </SectionCard>
  );
}
