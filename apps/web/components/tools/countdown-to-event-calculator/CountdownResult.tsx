import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CountdownOutput } from "./types";

type Props = {
  result: CountdownOutput;
  eventName: string;
  hasTarget: boolean;
  digitStyle: DigitStyle;
};

function Unit({ value, label, digitStyle }: { value: number; label: string; digitStyle: DigitStyle }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/60">
      <span dir="ltr" className="font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">
        {formatLocalizedNumber(value, digitStyle).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

export default function CountdownResult({ result, eventName, hasTarget, digitStyle }: Props) {
  const t = useTranslations("tools.countdown-to-event-calculator.result");

  if (!hasTarget) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("noTarget")}</p>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidDate")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{eventName || t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="mb-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {result.isPast ? t("elapsedSince") : t("countingDownTo")}
        </p>
        <div dir="ltr" className="grid grid-cols-4 gap-2">
          <Unit value={result.days} label={t("days")} digitStyle={digitStyle} />
          <Unit value={result.hours} label={t("hours")} digitStyle={digitStyle} />
          <Unit value={result.minutes} label={t("minutes")} digitStyle={digitStyle} />
          <Unit value={result.seconds} label={t("seconds")} digitStyle={digitStyle} />
        </div>
      </div>
    </div>
  );
}
