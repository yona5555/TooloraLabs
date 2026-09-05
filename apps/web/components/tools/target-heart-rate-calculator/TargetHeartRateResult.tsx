import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { TargetHeartRateResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import HeartRateZoneChart from "./HeartRateZoneChart";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function TargetHeartRateResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.target-heart-rate-calculator.result");
  const tZones = useTranslations("tools.target-heart-rate-calculator.zones");
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

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={result.zones.map((z) => `${tZones(z.key)}: ${fmt(z.lowBpm)}-${fmt(z.highBpm)} bpm`).join(", ")}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.maxHeartRate)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("maxHeartRate")}</p>
        </div>

        <div className="mt-5">
          <HeartRateZoneChart zones={result.zones} maxHeartRate={result.maxHeartRate} digitStyle={digitStyle} />
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          {result.zones.map((zone) => (
            <li key={zone.key} className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">
                {tZones(zone.key)} ({fmt(zone.lowPercent)}-{fmt(zone.highPercent)}%)
              </span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                {fmt(zone.lowBpm)}-{fmt(zone.highBpm)} {t("bpm")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
