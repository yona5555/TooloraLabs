import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { bandForBmr, type BMRResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import BMRComparisonChart from "./BMRComparisonChart";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function BMRResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.bmr-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidMeasurements")}</p>
        </div>
      </div>
    );
  }

  const single = result.harrisBenedict ?? result.mifflinStJeor;
  const isCompare = result.harrisBenedict !== null && result.mifflinStJeor !== null;
  const band = bandForBmr(single ?? 0);
  const bandColor =
    band === "higher"
      ? "fill-indigo-600 dark:fill-indigo-400"
      : band === "typical"
        ? "fill-blue-600 dark:fill-blue-400"
        : "fill-sky-600 dark:fill-sky-400";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={
            isCompare
              ? `Harris-Benedict: ${fmt(result.harrisBenedict!)} kcal, Mifflin-St Jeor: ${fmt(result.mifflinStJeor!)} kcal`
              : `BMR: ${fmt(single!)} kcal`
          }
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="mb-5 flex justify-center border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <RatioGauge
            value={single ?? 0}
            domainMin={800}
            domainMax={3000}
            zones={[
              { key: "lower", from: 800, to: 1400, colorClass: "stroke-sky-500 dark:stroke-sky-400" },
              { key: "typical", from: 1400, to: 2000, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
              { key: "higher", from: 2000, to: 3000, colorClass: "stroke-indigo-500 dark:stroke-indigo-400" },
            ]}
            valueLabel={fmt(single ?? 0)}
            caption={t(`range.${band}`)}
            captionColorClass={bandColor}
            ticks={[800, 1400, 2000, 3000]}
          />
        </div>
        {isCompare ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-blue-400 bg-blue-50 p-3 dark:border-blue-500/40 dark:bg-blue-500/10">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(result.harrisBenedict!)}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("harrisBenedict")}</p>
              </div>
              <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-3 dark:border-emerald-500/40 dark:bg-emerald-500/10">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(result.mifflinStJeor!)}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("mifflinStJeor")}</p>
              </div>
            </div>

            <div className="mt-5">
              <BMRComparisonChart harrisBenedict={result.harrisBenedict!} mifflinStJeor={result.mifflinStJeor!} digitStyle={digitStyle} />
            </div>

            <p className="mt-5 border-t border-zinc-100 pt-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {t("difference", { value: fmt(Math.abs(result.differenceKcal!)) })}
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(single!)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("bmrUnit")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
