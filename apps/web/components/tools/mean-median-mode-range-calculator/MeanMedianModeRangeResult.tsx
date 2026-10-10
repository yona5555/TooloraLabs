import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { MeanMedianModeRangeResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import MmmLive3D from "./MmmLive3D";
import MeanMedianModeRangeShareExportModal from "./MeanMedianModeRangeShareExportModal";

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
        <div className="flex items-center gap-2">
          <CopyButton
            text={`${t("mean")}=${fmt(result.mean)}, ${t("median")}=${fmt(result.median)}, ${t("mode")}=${modeText}, ${t("range")}=${fmt(result.range)}`}
            className="!text-white dark:!text-white"
          />
          <MeanMedianModeRangeShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[
              { label: t("mean"), value: fmt(result.mean) },
              { label: t("median"), value: fmt(result.median) },
              { label: t("mode"), value: modeText },
              { label: t("range"), value: fmt(result.range) },
              { label: t("count"), value: String(result.count) },
              { label: t("sum"), value: fmt(result.sum) },
              { label: t("min"), value: fmt(result.min) },
              { label: t("max"), value: fmt(result.max) },
            ]}
            heroLabel={t("mean")}
            heroValue={fmt(result.mean)}
            sentence={`${t("mean")}=${fmt(result.mean)}, ${t("median")}=${fmt(result.median)}, ${t("mode")}=${modeText}, ${t("range")}=${fmt(result.range)}`}
          />
        </div>
      </div>
      <div className="p-4 lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(result.mean)}
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("meanCaption", { count: result.count })}</p>
        <div className="mt-4">
          <MmmLive3D />
        </div>
      </div>
    </div>
  );
}
