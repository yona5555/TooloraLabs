import { useTranslations } from "next-intl";
import type { TimeResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import TimeClockDiagram from "./TimeClockDiagram";

type Props = {
  result: Result;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function TimeResult({ result }: Props) {
  const t = useTranslations("tools.time-calculator.result");

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidTime")}</p>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds } = result.result;
  const clockText = `${result.isNegative ? "-" : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={clockText} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6 text-center">
        <p dir="ltr" className="font-mono text-3xl font-bold text-blue-600 dark:text-blue-400">
          {clockText}
        </p>
        {result.isNegative && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("negativeNote")}</p>}

        <div className="mt-5">
          <TimeClockDiagram hours={hours} minutes={minutes} />
        </div>

        <p className="mt-5 border-t border-zinc-100 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t("totalSeconds")}: {Math.abs(result.totalSeconds)}
        </p>
      </div>
    </div>
  );
}
