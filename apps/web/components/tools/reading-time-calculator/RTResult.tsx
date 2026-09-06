import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { ReadingTimeOutput } from "./types";

type Props = {
  result: ReadingTimeOutput;
  digitStyle: DigitStyle;
};

export default function RTResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.reading-time-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle);

  if (result.error) {
    const messageKey = result.error === "empty-text" ? "emptyText" : "invalidRate";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  const timeLabel =
    result.minutes > 0
      ? t("timeMinutesSeconds", { minutes: fmt(result.minutes), seconds: fmt(result.seconds) })
      : t("timeSecondsOnly", { seconds: fmt(result.seconds) });

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">{timeLabel}</p>
        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("wordCountLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.wordCount)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
