"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertPaceSeconds, formatClock, type DistanceUnit } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import PaceGauge from "./PaceGauge";

type FinishTimeResultProps = {
  predictedSeconds: number;
  targetDistance: number;
  distanceUnit: DistanceUnit;
  digitStyle: DigitStyle;
};

export default function FinishTimeResult({ predictedSeconds, targetDistance, distanceUnit, digitStyle }: FinishTimeResultProps) {
  const t = useTranslations("tools.pace-calculator.result");
  const tFinish = useTranslations("tools.pace-calculator.finishTime");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const isValid = predictedSeconds > 0 && targetDistance > 0;
  const paceSecondsPerUnit = isValid ? predictedSeconds / targetDistance : 0;
  const paceSecondsPerKm = isValid ? (distanceUnit === "km" ? paceSecondsPerUnit : convertPaceSeconds(paceSecondsPerUnit, "mi", "km")) : undefined;
  const paceSecondsPerMi = isValid ? (distanceUnit === "mi" ? paceSecondsPerUnit : convertPaceSeconds(paceSecondsPerUnit, "km", "mi")) : 0;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{tFinish("resultHeading")}</h2>
        {isValid && <CopyButton text={formatClock(predictedSeconds)} className="!text-white dark:!text-white" />}
      </div>
      <div className="p-4 lg:p-6">
        {!isValid ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidInput")}</p>
        ) : (
          <>
            <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{formatClock(predictedSeconds)}</p>
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{tFinish("predictedTime")}</p>

            <div className="mt-5">
              <PaceGauge paceSecondsPerKm={paceSecondsPerKm} />
            </div>

            <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
              <li className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">{t("paceLabelKm")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {paceSecondsPerKm !== undefined ? formatClock(paceSecondsPerKm) : "—"} {t("perKm")}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">{t("paceLabelMi")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {formatClock(paceSecondsPerMi)} {t("perMi")}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">{tFinish("targetDistanceLabel")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {fmt(targetDistance)} {distanceUnit === "km" ? t("unitKm") : t("unitMi")}
                </span>
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
