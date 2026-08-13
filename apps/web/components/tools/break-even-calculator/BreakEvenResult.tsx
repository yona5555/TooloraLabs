"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BreakEvenOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import BreakEvenChart from "./BreakEvenChart";

type BreakEvenResultProps = {
  result: BreakEvenOutput | null;
  errorMessage: string;
  digitStyle: DigitStyle;
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
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

export default function BreakEvenResult({ result, errorMessage, digitStyle, fixedCosts, variableCostPerUnit, pricePerUnit }: BreakEvenResultProps) {
  const t = useTranslations("tools.break-even-calculator");

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
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("result.breakEvenUnits")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {formatLocalizedNumber(result.breakEvenUnits, digitStyle)}
          </p>

          <div className="mt-4">
            <BreakEvenChart
              fixedCosts={fixedCosts}
              variableCostPerUnit={variableCostPerUnit}
              pricePerUnit={pricePerUnit}
              breakEvenUnits={result.breakEvenUnits}
              fixedCostsLabel={t("aboveFold.chartFixedCosts")}
              totalCostLabel={t("aboveFold.chartTotalCost")}
              revenueLabel={t("aboveFold.chartRevenue")}
              breakEvenLabel={t("aboveFold.chartBreakEven")}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat title={t("result.breakEvenRevenue")} value={money(result.breakEvenRevenue)} />
            <Stat title={t("result.contributionMarginPerUnit")} value={money(result.contributionMarginPerUnit)} />
            <Stat
              title={t("result.contributionMarginRatio")}
              value={formatLocalizedNumber(result.contributionMarginRatio / 100, digitStyle, { style: "percent", maximumFractionDigits: 1 })}
            />
            {result.targetProfitUnits > 0 ? (
              <Stat title={t("result.targetProfitUnits")} value={formatLocalizedNumber(result.targetProfitUnits, digitStyle)} />
            ) : (
              <Stat title={t("result.targetProfitUnits")} value="—" />
            )}
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
