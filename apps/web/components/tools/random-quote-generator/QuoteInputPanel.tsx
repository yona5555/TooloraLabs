"use client";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { QUOTE_CATEGORIES } from "./types";
import type { QuoteCategory } from "./types";

type Props = {
  category: QuoteCategory | "all";
  onCategoryChange: (value: QuoteCategory | "all") => void;
  onNewQuote: () => void;
};

export default function QuoteInputPanel({ category, onCategoryChange, onNewQuote }: Props) {
  const t = useTranslations("tools.random-quote-generator.form");
  const tCategories = useTranslations("tools.random-quote-generator.categories");

  return (
    <SectionCard title={t("inputTitle")}>
      <div>
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("categoryLabel")}</span>
        <div className="flex flex-wrap gap-1.5">
          {QUOTE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                category === c
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {tCategories(c)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNewQuote}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <RefreshCw size={18} />
        {t("newQuote")}
      </button>
    </SectionCard>
  );
}
