"use client";
import { Calculator, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { InventoryValuationOutput } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import InventoryMethodChart from "./InventoryMethodChart";
import InventoryShareExportModal from "./InventoryShareExportModal";

type InventoryResultProps = {
  result: InventoryValuationOutput | null;
  hasCalculated: boolean;
  errorMessage: string;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function InventoryResult({ result, hasCalculated, errorMessage, digitStyle, currency }: InventoryResultProps) {
  const t = useTranslations("tools.inventory-valuation-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (errorMessage || !result) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage || t("aboveFold.placeholder")}
        </p>
      </SectionCard>
    );
  }

  const itemCount = result.items.length;
  const healthyPercent = itemCount > 0 ? ((itemCount - result.lowStockCount) / itemCount) * 100 : 100;
  const healthLabel =
    healthyPercent >= 90 ? t("result.stockHealth.good") : healthyPercent >= 60 ? t("result.stockHealth.fair") : t("result.stockHealth.atRisk");

  const inputRows = result.items.map((item) => ({ label: item.name, value: `${formatLocalizedNumber(item.endingUnits, digitStyle)} ${t("result.unitsSuffix")}` }));
  const resultRows = [
    { label: t("aboveFold.chartFifo"), value: money(result.totalValueFifo) },
    { label: t("aboveFold.chartLifo"), value: money(result.totalValueLifo) },
    { label: t("aboveFold.chartWeightedAverage"), value: money(result.totalValueWeightedAverage) },
    { label: t("result.totalEndingUnits"), value: formatLocalizedNumber(result.totalEndingUnits, digitStyle) },
    { label: t("result.lowStockCount"), value: formatLocalizedNumber(result.lowStockCount, digitStyle) },
  ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <InventoryShareExportModal
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("aboveFold.chartFifo")}
          heroValue={money(result.totalValueFifo)}
          sentence={t("aboveFold.sentence", { count: itemCount, value: money(result.totalValueFifo) })}
        />
      }
    >
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.chartTitle")}</p>
      <div className="mt-2">
        <InventoryMethodChart
          fifo={result.totalValueFifo}
          lifo={result.totalValueLifo}
          weightedAverage={result.totalValueWeightedAverage}
          fifoLabel={t("aboveFold.chartFifo")}
          lifoLabel={t("aboveFold.chartLifo")}
          weightedAverageLabel={t("aboveFold.chartWeightedAverage")}
          chartLabel={t("aboveFold.chartTitle")}
          formatValue={money}
        />
      </div>

      <div className="mt-5 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <RatioGauge
          value={healthyPercent}
          domainMin={0}
          domainMax={100}
          zones={[
            { key: "atRisk", from: 0, to: 60, colorClass: "stroke-red-500 dark:stroke-red-400" },
            { key: "fair", from: 60, to: 90, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
            { key: "good", from: 90, to: 100, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
          ]}
          valueLabel={`${Math.round(healthyPercent)}%`}
          caption={healthLabel}
          ticks={[0, 60, 90, 100]}
          tickFormatter={(tick) => `${tick}%`}
        />
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("result.stockHealth.caption")}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat title={t("result.totalEndingUnits")} value={formatLocalizedNumber(result.totalEndingUnits, digitStyle)} />
        <Stat title={t("result.lowStockCount")} value={formatLocalizedNumber(result.lowStockCount, digitStyle)} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="py-2 text-start font-semibold">{t("result.item")}</th>
              <th className="py-2 text-end font-semibold">{t("result.endingUnits")}</th>
              <th className="py-2 text-end font-semibold">{t("result.methodFifo")}</th>
              <th className="py-2 text-end font-semibold">{t("result.methodLifo")}</th>
              <th className="py-2 text-end font-semibold">{t("result.methodWeightedAverage")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item, index) => (
              <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="flex items-center gap-2 py-2 text-zinc-900 dark:text-zinc-100">
                  {item.belowThreshold && <AlertTriangle size={14} className="text-amber-500" />}
                  {item.name}
                </td>
                <td dir="ltr" className="py-2 text-end text-zinc-700 dark:text-zinc-300">
                  {formatLocalizedNumber(item.endingUnits, digitStyle)}
                </td>
                <td dir="ltr" className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">
                  {money(item.fifo.endingValue)}
                </td>
                <td dir="ltr" className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">
                  {money(item.lifo.endingValue)}
                </td>
                <td dir="ltr" className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">
                  {money(item.weightedAverage.endingValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
