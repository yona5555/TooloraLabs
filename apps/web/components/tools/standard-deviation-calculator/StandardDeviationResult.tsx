import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { StandardDeviationResult as Result } from "./types";
import SdLive3D from "./SdLive3D";
import StandardDeviationShareExportModal from "./StandardDeviationShareExportModal";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function StandardDeviationResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.standard-deviation-calculator.result");
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

  const sentence = t("sentence", { mean: fmt(result.mean), stdDev: fmt(result.populationStdDev) });

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <StandardDeviationShareExportModal
          inputRows={[{ label: t("countLabel"), value: `${result.count}` }]}
          resultRows={[
            { label: t("meanLabel"), value: fmt(result.mean) },
            { label: t("populationStdDev"), value: fmt(result.populationStdDev) },
            { label: t("sampleStdDev"), value: result.count > 1 ? fmt(result.sampleStdDev) : "—" },
          ]}
          heroLabel={t("populationStdDev")}
          heroValue={fmt(result.populationStdDev)}
          sentence={sentence}
        />
      </div>
      <div className="p-4 lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {`σ = ${fmt(result.populationStdDev)}`}
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("heroCaption", { s: fmt(result.sampleStdDev), mean: fmt(result.mean), count: result.count })}
        </p>
        <div className="mt-4">
          <SdLive3D />
        </div>
      </div>
    </div>
  );
}
