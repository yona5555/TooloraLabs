import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { DateResult as Result, DateCalculatorMode } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import DateSpanDiagram from "./DateSpanDiagram";

type Props = {
  mode: DateCalculatorMode;
  result: Result;
  digitStyle: DigitStyle;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function DateResult({ mode, result, digitStyle }: Props) {
  const t = useTranslations("tools.date-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

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

  if (mode === "difference" && result.difference) {
    const d = result.difference;
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton
            text={`${t("totalDays")}: ${fmt(d.totalDays)}, ${d.years}y ${d.months}m ${d.days}d`}
            className="!text-white dark:!text-white"
          />
        </div>
        <div className="p-4 lg:p-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(d.totalDays)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("totalDays")}</p>
          </div>

          <div className="mt-5">
            <DateSpanDiagram totalDays={d.totalDays} />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{d.years}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("years")}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{d.months}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("months")}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{d.days}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("days")}</p>
            </div>
          </div>

          <p className="mt-5 border-t border-zinc-100 pt-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t("totalWeeks")}: {fmt(d.totalWeeks)}
            {d.isEndBeforeStart ? ` (${t("endBeforeStart")})` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={formatDate(result.resultDateISO ?? "")} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6 text-center">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatDate(result.resultDateISO ?? "")}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("resultDate")}</p>
      </div>
    </div>
  );
}
