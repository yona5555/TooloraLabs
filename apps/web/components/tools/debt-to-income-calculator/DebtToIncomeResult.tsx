"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import DebtToIncomeBreakdownDonut from "./DebtToIncomeBreakdownDonut";
import DebtToIncomeShareExportModal from "./DebtToIncomeShareExportModal";
import type { DebtToIncomeResult as RatioResult, MaxAllowedDebtResult } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";
import type { DtiMode } from "./types";

type DebtToIncomeResultProps = {
  mode: DtiMode;
  currency: CurrencyCode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  monthlyGrossIncome: number;
  ratioResult: RatioResult;
  maxDebtResult: MaxAllowedDebtResult;
  targetBackEndRatio: number;
  scenarioBefore: RatioResult;
  scenarioAfter: RatioResult;
  proposedMonthlyPayment: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  healthy: "text-green-600 dark:text-green-400",
  manageable: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  veryHigh: "text-red-600 dark:text-red-400",
};

const ZONE_STROKE_COLORS: Record<string, string> = {
  healthy: "stroke-green-500 dark:stroke-green-400",
  manageable: "stroke-amber-500 dark:stroke-amber-400",
  high: "stroke-orange-500 dark:stroke-orange-400",
  veryHigh: "stroke-red-500 dark:stroke-red-400",
};

function buildDtiGaugeZones(domainMax: number) {
  return [
    { key: "healthy", from: 0, to: 36, colorClass: ZONE_STROKE_COLORS.healthy },
    { key: "manageable", from: 36, to: 43, colorClass: ZONE_STROKE_COLORS.manageable },
    { key: "high", from: 43, to: 50, colorClass: ZONE_STROKE_COLORS.high },
    { key: "veryHigh", from: 50, to: domainMax, colorClass: ZONE_STROKE_COLORS.veryHigh },
  ];
}

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

export default function DebtToIncomeResult({
  mode,
  currency,
  hasCalculated,
  digitStyle,
  monthlyGrossIncome,
  ratioResult,
  maxDebtResult,
  targetBackEndRatio,
  scenarioBefore,
  scenarioAfter,
  proposedMonthlyPayment,
}: DebtToIncomeResultProps) {
  const t = useTranslations("tools.debt-to-income-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });
  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })}%`;

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

  const heroLabel = mode === "ratio" ? t("aboveFold.backEndRatioLabel") : mode === "maxDebt" ? t("aboveFold.maxTotalMonthlyDebtLabel") : t("scenarioChart.afterLabel");
  const heroValue = mode === "ratio" ? percent(ratioResult.backEndRatio) : mode === "maxDebt" ? money(maxDebtResult.maxTotalMonthlyDebt) : percent(scenarioAfter.backEndRatio);
  const sentenceKey = mode === "ratio" ? "aboveFold.sentences.ratio" : mode === "maxDebt" ? "aboveFold.sentences.maxDebt" : "aboveFold.sentences.scenario";
  const sentence =
    mode === "ratio"
      ? t(sentenceKey, { income: money(monthlyGrossIncome), ratio: percent(ratioResult.backEndRatio), category: t(`aboveFold.category.${ratioResult.category}`) })
      : mode === "maxDebt"
        ? t(sentenceKey, { income: money(monthlyGrossIncome), target: percent(targetBackEndRatio), maxDebt: money(maxDebtResult.maxTotalMonthlyDebt) })
        : t(sentenceKey, {
            payment: money(proposedMonthlyPayment),
            before: percent(scenarioBefore.backEndRatio),
            after: percent(scenarioAfter.backEndRatio),
            category: t(`aboveFold.category.${scenarioAfter.category}`),
          });

  const inputRows =
    mode === "ratio"
      ? [{ label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) }]
      : mode === "maxDebt"
        ? [
            { label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) },
            { label: t("form.targetBackEndRatioLabel"), value: percent(targetBackEndRatio) },
            { label: t("form.existingMonthlyDebtLabel"), value: money(maxDebtResult.currentOtherDebt) },
          ]
        : [
            { label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) },
            { label: t("aboveFold.totalMonthlyDebtLabel"), value: money(scenarioBefore.totalMonthlyDebt) },
            { label: t("form.proposedMonthlyPaymentLabel"), value: money(proposedMonthlyPayment) },
          ];

  const resultRows =
    mode === "ratio"
      ? [
          { label: t("aboveFold.frontEndRatioLabel"), value: percent(ratioResult.frontEndRatio) },
          { label: t("aboveFold.totalMonthlyDebtLabel"), value: money(ratioResult.totalMonthlyDebt) },
          { label: t("aboveFold.categoryLabel"), value: t(`aboveFold.category.${ratioResult.category}`) },
        ]
      : mode === "maxDebt"
        ? [{ label: t("aboveFold.maxAdditionalMonthlyDebtLabel"), value: money(maxDebtResult.maxAdditionalMonthlyDebt) }]
        : [
            { label: t("scenarioChart.beforeLabel"), value: percent(scenarioBefore.backEndRatio) },
            { label: t("scenarioChart.afterLabel"), value: percent(scenarioAfter.backEndRatio) },
            { label: t("aboveFold.categoryLabel"), value: t(`aboveFold.category.${scenarioAfter.category}`) },
          ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<DebtToIncomeShareExportModal mode={mode} inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>
      {mode === "ratio" && (
        <p className={`mt-1 text-center text-sm font-semibold ${CATEGORY_COLORS[ratioResult.category]}`}>{t(`aboveFold.category.${ratioResult.category}`)}</p>
      )}
      {mode === "scenario" && (
        <p className={`mt-1 text-center text-sm font-semibold ${CATEGORY_COLORS[scenarioAfter.category]}`}>{t(`aboveFold.category.${scenarioAfter.category}`)}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        {mode === "ratio" ? (
          <>
            <Stat title={t("aboveFold.frontEndRatioLabel")} value={percent(ratioResult.frontEndRatio)} />
            <Stat title={t("aboveFold.totalMonthlyDebtLabel")} value={money(ratioResult.totalMonthlyDebt)} />
          </>
        ) : mode === "maxDebt" ? (
          <>
            <Stat title={t("aboveFold.maxAdditionalMonthlyDebtLabel")} value={money(maxDebtResult.maxAdditionalMonthlyDebt)} />
            <Stat title={t("form.existingMonthlyDebtLabel")} value={money(maxDebtResult.currentOtherDebt)} />
          </>
        ) : (
          <>
            <Stat title={t("scenarioChart.beforeLabel")} value={percent(scenarioBefore.backEndRatio)} />
            <Stat title={t("form.proposedMonthlyPaymentLabel")} value={money(proposedMonthlyPayment)} />
          </>
        )}
      </div>

      {(mode === "ratio" || mode === "scenario") &&
        (() => {
          const gaugeValue = mode === "ratio" ? ratioResult.backEndRatio : scenarioAfter.backEndRatio;
          const gaugeCategory = mode === "ratio" ? ratioResult.category : scenarioAfter.category;
          const domainMax = Math.max(70, Math.ceil((gaugeValue + 10) / 10) * 10);
          return (
            <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <RatioGauge
                value={gaugeValue}
                domainMin={0}
                domainMax={domainMax}
                zones={buildDtiGaugeZones(domainMax)}
                valueLabel={percent(gaugeValue)}
                caption={t(`aboveFold.category.${gaugeCategory}`)}
                captionColorClass={CATEGORY_COLORS[gaugeCategory]}
                ticks={[0, 36, 43, 50]}
                tickFormatter={(tick) => `${tick}%`}
              />
            </div>
          );
        })()}

      {mode === "maxDebt" && (
        <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <DebtToIncomeBreakdownDonut
            centerValue={money(maxDebtResult.maxTotalMonthlyDebt)}
            centerLabel={t("aboveFold.maxTotalMonthlyDebtLabel")}
            segments={[
              { key: "existing", value: maxDebtResult.currentOtherDebt, label: t("form.existingMonthlyDebtLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
              { key: "additional", value: maxDebtResult.maxAdditionalMonthlyDebt, label: t("aboveFold.maxAdditionalMonthlyDebtLabel"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
            ]}
          />
        </div>
      )}
    </SectionCard>
  );
}
