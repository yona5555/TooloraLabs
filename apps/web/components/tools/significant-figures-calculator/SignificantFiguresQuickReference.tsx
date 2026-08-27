"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const RULE_KEYS = ["nonzero", "sandwiched", "leading", "trailing"] as const;

export default function SignificantFiguresQuickReference() {
  const t = useTranslations("tools.significant-figures-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-3">
        {RULE_KEYS.map((key) => (
          <li key={key} className="flex gap-3 text-sm">
            <span dir="ltr" className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 font-mono font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {t(`rules.${key}.example`)}
            </span>
            <span className="text-zinc-600 dark:text-zinc-300">{t(`rules.${key}.text`)}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
