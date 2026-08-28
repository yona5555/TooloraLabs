import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { ReadabilityResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function ReadabilityResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.readability-score-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error === "empty-text") {
    return <ErrorCard heading={t("heading")} message={t("emptyText")} />;
  }
  if (result.error === "no-sentences") {
    return <ErrorCard heading={t("heading")} message={t("noSentences")} />;
  }

  const bandLabel = result.readingEaseLabel ? t(`bands.${result.readingEaseLabel}`) : "";
  const copyText = `${t("fleschReadingEase")}: ${fmt(result.fleschReadingEase)} (${bandLabel}), ${t("fleschKincaidGrade")}: ${fmt(result.fleschKincaidGrade)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("fleschReadingEase")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.fleschReadingEase)}
          </p>
          <p className="mt-1 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300">{bandLabel}</p>

          <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <Stat label={t("fleschKincaidGrade")} value={fmt(result.fleschKincaidGrade)} />
            <Stat label={t("averageWordsPerSentence")} value={fmt(result.averageWordsPerSentence)} />
            <Stat label={t("averageSyllablesPerWord")} value={fmt(result.averageSyllablesPerWord)} />
            <Stat label={t("wordCount")} value={fmtInt(result.wordCount)} />
            <Stat label={t("sentenceCount")} value={fmtInt(result.sentenceCount)} />
            <Stat label={t("syllableCount")} value={fmtInt(result.syllableCount)} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
