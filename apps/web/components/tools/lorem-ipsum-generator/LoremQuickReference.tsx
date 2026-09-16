"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function LoremQuickReference() {
  const t = useTranslations("tools.lorem-ipsum-generator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <dt className="text-zinc-600 dark:text-zinc-300">{t("wordsPerSentenceLabel")}</dt>
          <dd dir="ltr" className="font-mono font-semibold text-blue-700 dark:text-blue-300">
            5–14
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-600 dark:text-zinc-300">{t("sentencesPerParagraphLabel")}</dt>
          <dd dir="ltr" className="font-mono font-semibold text-blue-700 dark:text-blue-300">
            3–6
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
