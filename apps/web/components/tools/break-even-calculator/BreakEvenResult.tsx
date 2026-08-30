"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BreakEvenOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import BreakEvenChart from "./BreakEvenChart";
import BreakEvenShareExportModal from "./BreakEvenShareExportModal";
import type { BreakEvenMode } from "./types";

type BreakEvenResultProps = {
  mode: BreakEvenMode;
  hasCalculated: boolean;
  result: BreakEvenOutput | null;
  errorMessage: string;
  digitStyle: DigitStyle;
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  targetProfit: number;
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

export default function BreakEvenResult({ mode, hasCalculated, result, errorMessage, digitStyle, fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit }: BreakEvenResultProps) {
  const t = useTranslations("tools.break-even-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

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
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{errorMessage}</p>
      </SectionCard>
    );
  }

  const heroLabel = mode === "breakEven" ? t("result.breakEvenUnits") : t("result.targetProfitUnits");
  const heroValue = mode === "breakEven" ? formatLocalizedNumber(result.breakEvenUnits, digitStyle) : formatLocalizedNumber(result.targetProfitUnits, digitStyle);
  const sentence =
    mode === "breakEven"
      ? t("aboveFold.sentences.breakEven", { units: formatLocalizedNumber(result.breakEvenUnits, digitStyle), revenue: money(result.breakEvenRevenue) })
      : t("aboveFold.sentences.targetProfit", { profit: money(targetProfit), units: formatLocalizedNumber(result.targetProfitUnits, digitStyle) });

  const inputRows = [
    { label: t("form.fixedCosts"), value: money(fixedCosts) },
    { label: t("form.variableCostPerUnit"), value: money(variableCostPerUnit) },
    { label: t("form.pricePerUnit"), value: money(pricePerUnit) },
    ...(mode === "targetProfit" ? [{ label: t("form.targetProfit"), value: money(targetProfit) }] : []),
  ];

  const resultRows =
    mode === "breakEven"
      ? [
          { label: t("result.breakEvenRevenue"), value: money(result.breakEvenRevenue) },
          { label: t("result.contributionMarginPerUnit"), value: money(result.contributionMarginPerUnit) },
          { label: t("result.contributionMarginRatio"), value: formatLocalizedNumber(result.contributionMarginRatio / 100, digitStyle, { style: "percent", maximumFractionDigits: 1 }) },
        ]
      : [
          { label: t("result.targetProfitRevenue"), value: money(result.targetProfitRevenue) },
          { label: t("result.breakEvenUnits"), value: formatLocalizedNumber(result.breakEvenUnits, digitStyle) },
        ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<BreakEvenShareExportModal mode={mode} inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <div className="mt-4">
        <BreakEvenChart
          fixedCosts={fixedCosts}
          variableCostPerUnit={variableCostPerUnit}
          pricePerUnit={pricePerUnit}
          breakEvenUnits={result.breakEvenUnits}
          targetProfitUnits={mode === "targetProfit" ? result.targetProfitUnits : 0}
          digitStyle={digitStyle}
          fixedCostsLabel={t("aboveFold.chartFixedCosts")}
          totalCostLabel={t("aboveFold.chartTotalCost")}
          revenueLabel={t("aboveFold.chartRevenue")}
          breakEvenLabel={t("aboveFold.chartBreakEven")}
          targetProfitLabel={t("aboveFold.chartTargetProfit")}
          tooltipUnitsLabel={t("aboveFold.tooltipUnits")}
          tooltipProfitLabel={t("aboveFold.tooltipProfit")}
          chartAriaLabel={t("aboveFold.chartAriaLabel")}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {mode === "breakEven" ? (
          <>
            <Stat title={t("result.breakEvenRevenue")} value={money(result.breakEvenRevenue)} />
            <Stat title={t("result.contributionMarginPerUnit")} value={money(result.contributionMarginPerUnit)} />
            <Stat
              title={t("result.contributionMarginRatio")}
              value={formatLocalizedNumber(result.contributionMarginRatio / 100, digitStyle, { style: "percent", maximumFractionDigits: 1 })}
            />
          </>
        ) : (
          <>
            <Stat title={t("result.targetProfitRevenue")} value={money(result.targetProfitRevenue)} />
            <Stat title={t("result.breakEvenUnits")} value={formatLocalizedNumber(result.breakEvenUnits, digitStyle)} />
          </>
        )}
      </div>
    </SectionCard>
  );
}
