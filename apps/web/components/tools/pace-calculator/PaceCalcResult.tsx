"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { formatClock, type PaceCalcResult as Result } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import PaceGauge from "./PaceGauge";
import type { SolveField } from "./types";

type PaceCalcResultProps = {
  result: Result;
  solveFor: SolveField;
  digitStyle: DigitStyle;
};

export default function PaceCalcResult({ result, solveFor, digitStyle }: PaceCalcResultProps) {
  const t = useTranslations("tools.pace-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (!result.valid) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidInput")}</p>
          <div className="mt-4">
            <PaceGauge />
          </div>
        </div>
      </div>
    );
  }

  const unitLabel = result.distanceUnit === "km" ? t("perKm") : t("perMi");
  const bigValue =
    solveFor === "pace"
      ? `${formatClock(result.distanceUnit === "km" ? result.paceSecondsPerKm : result.paceSecondsPerMi)} ${unitLabel}`
      : solveFor === "time"
        ? formatClock(result.timeSeconds)
        : `${fmt(result.distance)} ${result.distanceUnit === "km" ? t("unitKm") : t("unitMi")}`;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={bigValue} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{bigValue}</p>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t(`solvedFor.${solveFor}`)}</p>

        <div className="mt-5">
          <PaceGauge paceSecondsPerKm={result.paceSecondsPerKm} />
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("distanceLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {fmt(result.distance)} {result.distanceUnit === "km" ? t("unitKm") : t("unitMi")}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("timeLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatClock(result.timeSeconds)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("paceLabelKm")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatClock(result.paceSecondsPerKm)} {t("perKm")}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("paceLabelMi")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatClock(result.paceSecondsPerMi)} {t("perMi")}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("speedKmh")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.speedKmh)} {t("kmh")}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("speedMph")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.speedMph)} {t("mph")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
