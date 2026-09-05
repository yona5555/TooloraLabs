import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { MeanMedianModeRangeResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import MeanMedianModeRangeDiagram from "./MeanMedianModeRangeDiagram";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function MeanMedianModeRangeResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.mean-median-mode-range-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("emptyDataset")}</p>
        </div>
      </div>
    );
  }

  const modeText = result.hasMode ? result.mode.map((m) => fmt(m)).join(", ") : t("noMode");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={`${t("mean")}=${fmt(result.mean)}, ${t("median")}=${fmt(result.median)}, ${t("mode")}=${modeText}, ${t("range")}=${fmt(result.range)}`}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <MeanMedianModeRangeDiagram sortedValues={result.sortedValues} mean={result.mean} median={result.median} digitStyle={digitStyle} />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-400 bg-blue-50 p-3 text-center dark:border-blue-500/40 dark:bg-blue-500/10">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(result.mean)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("mean")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-zinc-800">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(result.median)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("median")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-zinc-800">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{modeText}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("mode")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-zinc-800">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(result.range)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("range")}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("count")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.count}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("sum")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.sum)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("min")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.min)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("max")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.max)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
