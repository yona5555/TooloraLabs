import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { StandardDeviationResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import StandardDeviationChart from "./StandardDeviationChart";

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

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={`${t("populationStdDev")}: ${fmt(result.populationStdDev)}, ${t("sampleStdDev")}: ${fmt(result.sampleStdDev)}`}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.populationStdDev)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("populationStdDev")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.count > 1 ? fmt(result.sampleStdDev) : "—"}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("sampleStdDev")}</p>
          </div>
        </div>

        <div className="mt-5">
          <StandardDeviationChart values={result.deviations.map((d) => d.value)} mean={result.mean} populationStdDev={result.populationStdDev} />
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("countLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.count}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("meanLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.mean)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("populationVariance")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.populationVariance)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("sampleVariance")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.count > 1 ? fmt(result.sampleVariance) : "—"}</span>
          </li>
        </ul>

        {result.count > 0 && (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("stepsTitle")}</p>
            <div dir="ltr" className="max-h-48 overflow-y-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-white dark:bg-zinc-900">
                  <tr className="border-b border-zinc-200 text-start font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    <th className="px-2 py-1.5 text-start">{t("columnValue")}</th>
                    <th className="px-2 py-1.5 text-start">{t("columnDeviation")}</th>
                    <th className="px-2 py-1.5 text-start">{t("columnSquared")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.deviations.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
                      <td className="px-2 py-1.5 font-mono">{fmt(row.value)}</td>
                      <td className="px-2 py-1.5 font-mono">{fmt(row.deviation)}</td>
                      <td className="px-2 py-1.5 font-mono">{fmt(row.squaredDeviation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
