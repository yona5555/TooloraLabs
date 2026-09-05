import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import type { PregnancyResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import PregnancyWeekProgress from "./PregnancyWeekProgress";
import PregnancySizeCard from "./PregnancySizeCard";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function PregnancyResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.pregnancy-calculator.result");

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`errors.${result.error}`)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={`${t("week")}: ${result.gestationalAgeWeeks}w ${result.gestationalAgeDays}d, ${t("dueDate")}: ${formatDate(result.dueDateISO)}`}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t("weekValue", { weeks: result.gestationalAgeWeeks, days: result.gestationalAgeDays })}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("trimesterValue", { n: result.trimester })}
          </p>
        </div>

        <div className="mt-5">
          <PregnancyWeekProgress percentComplete={result.percentComplete} gestationalAgeWeeks={result.gestationalAgeWeeks} />
        </div>

        {result.currentWeekMilestone && (
          <div className="mt-5">
            <PregnancySizeCard milestone={result.currentWeekMilestone} digitStyle={digitStyle} />
          </div>
        )}

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("dueDate")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatDate(result.dueDateISO)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("daysUntilDue")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.daysUntilDue}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
