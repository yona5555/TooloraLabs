import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { ScheduleResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ScheduleResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.class-schedule-builder.result");
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error) {
    const messageKey =
      result.error === "empty-schedule" ? "emptySchedule" : result.error === "invalid-class-time" ? "invalidClassTime" : "missingDays";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
          {result.errorDetail && <p dir="ltr" className="mt-2 text-center text-xs text-zinc-400">{result.errorDetail}</p>}
        </div>
      </div>
    );
  }

  const totalHours = result.totalWeeklyMinutes / 60;
  const copyText = result.hasConflicts
    ? `${t("conflictsFoundLabel")}: ${fmtInt(result.conflicts.length)}`
    : `${t("noConflicts")} — ${fmtInt(totalHours)} ${t("hoursPerWeek")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          {result.hasConflicts ? (
            <p className="text-center text-sm font-semibold text-amber-600 dark:text-amber-400">
              {t("conflictsFoundLabel")}: {fmtInt(result.conflicts.length)}
            </p>
          ) : (
            <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("noConflicts")}</p>
          )}
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {fmtInt(totalHours)} {t("hoursPerWeek")}
          </p>

          {result.hasConflicts && (
            <ul dir="ltr" className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
              {result.conflicts.map((conflict, i) => (
                <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <span className="font-semibold">{conflict.classNameA}</span> {t("conflictsWith")}{" "}
                  <span className="font-semibold">{conflict.classNameB}</span> — {t(`day.${conflict.day}`)},{" "}
                  {formatClock(conflict.overlapStartMinutes)}–{formatClock(conflict.overlapEndMinutes)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
