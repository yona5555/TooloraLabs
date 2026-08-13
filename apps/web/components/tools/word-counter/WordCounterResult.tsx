"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { TextCounterOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import TopKeywordsChart from "./TopKeywordsChart";

type WordCounterResultProps = {
  stats: TextCounterOutput;
  hasText: boolean;
  digitStyle: DigitStyle;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function WordCounterResult({ stats, hasText, digitStyle }: WordCounterResultProps) {
  const t = useTranslations("tools.word-counter");

  const summaryText = [
    "words",
    "characters",
    "charactersNoSpaces",
    "sentences",
    "paragraphs",
    "readingTimeMinutes",
    "uniqueWords",
    "averageWordLength",
  ]
    .map((key) => `${t(`stats.${key}`)}: ${formatLocalizedNumber(stats[key as keyof TextCounterOutput] as number, digitStyle)}`)
    .join("\n");

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={hasText ? <CopyButton text={summaryText} /> : undefined}
    >
      {hasText ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("stats.words")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {formatLocalizedNumber(stats.words, digitStyle)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat title={t("stats.characters")} value={formatLocalizedNumber(stats.characters, digitStyle)} />
            <Stat title={t("stats.charactersNoSpaces")} value={formatLocalizedNumber(stats.charactersNoSpaces, digitStyle)} />
            <Stat title={t("stats.sentences")} value={formatLocalizedNumber(stats.sentences, digitStyle)} />
            <Stat title={t("stats.paragraphs")} value={formatLocalizedNumber(stats.paragraphs, digitStyle)} />
            <Stat title={t("stats.readingTimeMinutes")} value={formatLocalizedNumber(stats.readingTimeMinutes, digitStyle)} />
            <Stat title={t("stats.uniqueWords")} value={formatLocalizedNumber(stats.uniqueWords, digitStyle)} />
            <Stat title={t("stats.averageWordLength")} value={formatLocalizedNumber(stats.averageWordLength, digitStyle)} />
            <Stat title={t("stats.longestWord")} value={stats.longestWord || "—"} />
          </div>

          {stats.topKeywords.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("aboveFold.keywordsTitle")}</p>
              <TopKeywordsChart keywords={stats.topKeywords} chartLabel={t("aboveFold.keywordsTitle")} />
            </div>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
