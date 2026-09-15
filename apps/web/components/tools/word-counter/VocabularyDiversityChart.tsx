"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  words: number;
  uniqueWords: number;
  digitStyle: DigitStyle;
};

const WIDTH = 100;

/**
 * Live proportional bar of unique words vs. repeated words in the entered
 * text — a type-token ratio visual grounded in stats.uniqueWords, the tool's
 * own already-computed vocabulary metric, distinct from TopKeywordsChart
 * (which ranks specific words) and TextPipelineDiagram (a static concept
 * illustration of the tokenize→count pipeline).
 */
export default function VocabularyDiversityChart({ words, uniqueWords, digitStyle }: Props) {
  const t = useTranslations("tools.word-counter.vocabularyDiversity");

  if (words === 0) return null;

  const uniqueRatio = Math.min(uniqueWords / words, 1);
  const repeatedRatio = 1 - uniqueRatio;
  const percent = Math.round(uniqueRatio * 100);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("title")}</p>
        <span dir="ltr" className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
          {formatLocalizedNumber(percent, digitStyle)}%
        </span>
      </div>
      <div dir="ltr" className="flex h-6 w-full overflow-hidden rounded-lg">
        <div className="bg-blue-600 dark:bg-blue-400" style={{ width: `${uniqueRatio * WIDTH}%` }} />
        <div className="bg-zinc-300 dark:bg-zinc-600" style={{ width: `${repeatedRatio * WIDTH}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("uniqueLabel", { count: formatLocalizedNumber(uniqueWords, digitStyle) })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          {t("repeatedLabel", { count: formatLocalizedNumber(words - uniqueWords, digitStyle) })}
        </span>
      </div>
    </div>
  );
}
