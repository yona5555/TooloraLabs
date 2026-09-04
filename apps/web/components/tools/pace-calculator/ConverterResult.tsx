"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertPaceSeconds, formatClock, type DistanceUnit } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import PaceGauge from "./PaceGauge";

type ConverterResultProps = {
  fromUnit: DistanceUnit;
  paceSecondsPerUnit: number;
  digitStyle: DigitStyle;
};

export default function ConverterResult({ fromUnit, paceSecondsPerUnit, digitStyle }: ConverterResultProps) {
  const t = useTranslations("tools.pace-calculator.result");
  const tConv = useTranslations("tools.pace-calculator.converter");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const isValid = Number.isFinite(paceSecondsPerUnit) && paceSecondsPerUnit > 0;
  const toUnit: DistanceUnit = fromUnit === "km" ? "mi" : "km";
  const convertedPace = isValid ? convertPaceSeconds(paceSecondsPerUnit, fromUnit, toUnit) : 0;
  const paceSecondsPerKm = isValid ? (fromUnit === "km" ? paceSecondsPerUnit : convertedPace) : undefined;
  const speedKmh = paceSecondsPerKm ? 3600 / paceSecondsPerKm : 0;
  const paceSecondsPerMi = isValid ? (fromUnit === "mi" ? paceSecondsPerUnit : convertedPace) : 0;
  const speedMph = paceSecondsPerMi ? 3600 / paceSecondsPerMi : 0;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{tConv("resultHeading")}</h2>
        {isValid && <CopyButton text={`${formatClock(convertedPace)} ${toUnit === "km" ? t("perKm") : t("perMi")}`} className="!text-white dark:!text-white" />}
      </div>
      <div className="p-4 lg:p-6">
        {!isValid ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidInput")}</p>
        ) : (
          <>
            <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatClock(convertedPace)} {toUnit === "km" ? t("perKm") : t("perMi")}
            </p>
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {formatClock(paceSecondsPerUnit)} {fromUnit === "km" ? t("perKm") : t("perMi")} {tConv("equals")}
            </p>

            <div className="mt-5">
              <PaceGauge paceSecondsPerKm={paceSecondsPerKm} />
            </div>

            <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
              <li className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">{t("speedKmh")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {fmt(speedKmh)} {t("kmh")}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">{t("speedMph")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {fmt(speedMph)} {t("mph")}
                </span>
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
