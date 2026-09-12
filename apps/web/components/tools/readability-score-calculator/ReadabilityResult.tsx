import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import ReadabilityShareExportModal from "./ReadabilityShareExportModal";
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
  const sentence = `${t("fleschReadingEase")}: ${fmt(result.fleschReadingEase)} (${bandLabel}), ${t("fleschKincaidGrade")}: ${fmt(result.fleschKincaidGrade)}`;

  const resultRows = [
    { label: t("fleschKincaidGrade"), value: fmt(result.fleschKincaidGrade) },
    { label: t("averageWordsPerSentence"), value: fmt(result.averageWordsPerSentence) },
    { label: t("averageSyllablesPerWord"), value: fmt(result.averageSyllablesPerWord) },
    { label: t("wordCount"), value: fmtInt(result.wordCount) },
    { label: t("sentenceCount"), value: fmtInt(result.sentenceCount) },
    { label: t("syllableCount"), value: fmtInt(result.syllableCount) },
  ];

  const clampedScore = Math.max(-30, Math.min(100, result.fleschReadingEase));
  const gauge = {
    domainMin: -30,
    domainMax: 100,
    value: clampedScore,
    zones: [
      { from: -30, to: 30, color: "#dc2626" },
      { from: 30, to: 50, color: "#f97316" },
      { from: 50, to: 60, color: "#f59e0b" },
      { from: 60, to: 70, color: "#facc15" },
      { from: 70, to: 80, color: "#84cc16" },
      { from: 80, to: 90, color: "#22c55e" },
      { from: 90, to: 100, color: "#059669" },
    ],
    ticks: [-30, 0, 30, 60, 90, 100],
    valueLabel: fmt(result.fleschReadingEase),
    caption: bandLabel,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <ReadabilityShareExportModal
            inputRows={[]}
            resultRows={resultRows}
            heroLabel={t("fleschReadingEase")}
            heroValue={fmt(result.fleschReadingEase)}
            sentence={sentence}
            gauge={gauge}
          />
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
