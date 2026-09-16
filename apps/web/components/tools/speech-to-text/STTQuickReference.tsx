"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function STTQuickReference() {
  const t = useTranslations("tools.speech-to-text.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <li>• {t("factorMicrophone")}</li>
        <li>• {t("factorNoise")}</li>
        <li>• {t("factorPace")}</li>
        <li>• {t("factorConnection")}</li>
      </ul>
    </SectionCard>
  );
}
