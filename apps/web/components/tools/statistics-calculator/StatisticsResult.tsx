import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import StatisticsDotPlotDiagram from "./StatisticsDotPlotDiagram";
import type { StatisticsResult as Result } from "./types";

type Props = {
  result: Result;
  values: number[];
  digitStyle: DigitStyle;
};

export default function StatisticsResult({ result, values, digitStyle }: Props) {
  const t = useTranslations("tools.statistics-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "empty-dataset") {
    return <ErrorCard heading={t("heading")} message={t("emptyDataset")} />;
  }

  const modeText = result.mode.length === 0 ? t("noMode") : result.mode.map(fmt).join(", ");
  const copyText = `${t("mean")}: ${fmt(result.mean)}, ${t("median")}: ${fmt(result.median)}, ${t("stdDev")}: ${fmt(result.sampleStdDev)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.mean)}
          </p>
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("meanCaption", { count: result.count })}</p>

          <StatisticsDotPlotDiagram
            values={values}
            mean={result.mean}
            median={result.median}
            meanLabel={t("mean")}
            medianLabel={t("median")}
            caption={t("diagramCaption")}
          />

          <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-3 dark:border-zinc-800">
            <Stat label={t("count")} value={String(result.count)} />
            <Stat label={t("sum")} value={fmt(result.sum)} />
            <Stat label={t("median")} value={fmt(result.median)} />
            <Stat label={t("mode")} value={modeText} />
            <Stat label={t("min")} value={fmt(result.min)} />
            <Stat label={t("max")} value={fmt(result.max)} />
            <Stat label={t("range")} value={fmt(result.range)} />
            <Stat label={t("populationStdDev")} value={fmt(result.populationStdDev)} />
            <Stat label={t("sampleStdDev")} value={fmt(result.sampleStdDev)} />
            <Stat label={t("populationVariance")} value={fmt(result.populationVariance)} />
            <Stat label={t("sampleVariance")} value={fmt(result.sampleVariance)} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
