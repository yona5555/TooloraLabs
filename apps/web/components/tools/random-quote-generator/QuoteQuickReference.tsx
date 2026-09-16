"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const LIBRARY_COUNTS: { key: "motivational" | "literary" | "philosophical"; count: number }[] = [
  { key: "motivational", count: 10 },
  { key: "literary", count: 10 },
  { key: "philosophical", count: 10 },
];

export default function QuoteQuickReference() {
  const t = useTranslations("tools.random-quote-generator.quickReference");
  const tCategories = useTranslations("tools.random-quote-generator.categories");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {LIBRARY_COUNTS.map(({ key, count }) => (
          <div key={key} className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
            <dt className="text-zinc-600 dark:text-zinc-300">{tCategories(key)}</dt>
            <dd dir="ltr" className="font-mono font-semibold text-blue-700 dark:text-blue-300">
              {count}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <dt>{t("totalLabel")}</dt>
          <dd dir="ltr">{LIBRARY_COUNTS.reduce((sum, c) => sum + c.count, 0)}</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
