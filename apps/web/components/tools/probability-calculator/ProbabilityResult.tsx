import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { SingleEventResult, CompoundResult, ProbabilityMode } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import ProbabilityBar from "./ProbabilityBar";

type Props = {
  mode: ProbabilityMode;
  singleResult: SingleEventResult;
  compoundResult: CompoundResult;
  digitStyle: DigitStyle;
};

export default function ProbabilityResult({ mode, singleResult, compoundResult, digitStyle }: Props) {
  const t = useTranslations("tools.probability-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });
  const fmtOdds = (value: number) => (Number.isFinite(value) ? fmt(value) : "∞");

  const result = mode === "single" ? singleResult : compoundResult;
  const isValid = mode === "single" ? singleResult.valid : compoundResult.valid;
  const percentage = result.percentage;

  if (!isValid) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`invalid.${mode}`)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={`P = ${fmt(result.probability)} (${fmt(percentage)}%)`} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <ProbabilityBar percentage={percentage} digitStyle={digitStyle} />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-400 bg-blue-50 p-3 text-center dark:border-blue-500/40 dark:bg-blue-500/10">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(result.probability)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("probability")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-zinc-800">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(percentage)}%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("percentage")}</p>
          </div>
        </div>

        {mode === "single" && (
          <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("oddsFor")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">1 : {fmtOdds(singleResult.oddsAgainst)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("oddsAgainst")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmtOdds(singleResult.oddsAgainst)} : 1</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
