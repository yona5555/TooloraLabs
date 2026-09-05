import { useTranslations } from "next-intl";
import type { DueDateResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import PregnancyProgressBar from "./PregnancyProgressBar";

type Props = {
  result: Result;
};

function formatDate(iso: string, locale: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export default function DueDateResult({ result }: Props) {
  const t = useTranslations("tools.due-date-calculator.result");

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

  const dueDateFormatted = formatDate(result.dueDateISO, "en-US");
  const conceptionFormatted = formatDate(result.conceptionDateISO, "en-US");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={`${t("dueDate")}: ${dueDateFormatted}, ${t("gestationalAge")}: ${result.gestationalAgeWeeks}w ${result.gestationalAgeDays}d`}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dueDateFormatted}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("dueDate")}</p>
        </div>

        <div className="mt-5">
          <PregnancyProgressBar percentComplete={result.percentComplete} gestationalAgeWeeks={result.gestationalAgeWeeks} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-400 bg-blue-50 p-3 text-center dark:border-blue-500/40 dark:bg-blue-500/10">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {result.gestationalAgeWeeks}w {result.gestationalAgeDays}d
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("gestationalAge")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-zinc-800">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{t(`trimesterValue.${result.trimester}`)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("trimester")}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("conceptionDate")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{conceptionFormatted}</span>
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
