import { useTranslations } from "next-intl";
import { Quote as QuoteIcon } from "lucide-react";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { Quote } from "./types";

type Props = {
  quote: Quote;
};

export default function QuoteResult({ quote }: Props) {
  const t = useTranslations("tools.random-quote-generator.result");
  const tCategories = useTranslations("tools.random-quote-generator.categories");
  const copyText = `"${quote.text}" — ${quote.author}`;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={copyText} className="!text-white dark:!text-white" />
      </div>
      <div className="flex flex-col items-center gap-4 p-6 lg:p-8">
        <QuoteIcon size={28} className="text-blue-300 dark:text-blue-500/60" />
        <p className="text-center text-xl leading-8 text-zinc-800 dark:text-zinc-100">{quote.text}</p>
        <div className="text-center">
          <p className="font-semibold text-zinc-700 dark:text-zinc-200">— {quote.author}</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{quote.source}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {tCategories(quote.category)}
        </span>
      </div>
    </div>
  );
}
