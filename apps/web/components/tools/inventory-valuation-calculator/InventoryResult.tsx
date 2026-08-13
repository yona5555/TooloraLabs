"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { InventoryValuationOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import InventoryMethodChart from "./InventoryMethodChart";

type InventoryResultProps = {
  result: InventoryValuationOutput | null;
  errorMessage: string;
  digitStyle: DigitStyle;
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

export default function InventoryResult({ result, errorMessage, digitStyle }: InventoryResultProps) {
  const t = useTranslations("tools.inventory-valuation-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      ) : result ? (
        <>
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
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
