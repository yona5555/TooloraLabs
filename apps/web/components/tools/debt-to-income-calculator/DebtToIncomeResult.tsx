"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import DebtToIncomeShareExportModal from "./DebtToIncomeShareExportModal";
import type { DebtToIncomeResult as RatioResult, MaxAllowedDebtResult } from "@tooloralabs/tools";
import type { DtiMode } from "./types";

type DebtToIncomeResultProps = {
  mode: DtiMode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  monthlyGrossIncome: number;
  ratioResult: RatioResult;
  maxDebtResult: MaxAllowedDebtResult;
  targetBackEndRatio: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  healthy: "text-green-600 dark:text-green-400",
  manageable: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  veryHigh: "text-red-600 dark:text-red-400",
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

export default function DebtToIncomeResult({
  mode,
  hasCalculated,
  digitStyle,
  monthlyGrossIncome,
  ratioResult,
  maxDebtResult,
  targetBackEndRatio,
}: DebtToIncomeResultProps) {
  const t = useTranslations("tools.debt-to-income-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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

  const heroLabel = mode === "ratio" ? t("aboveFold.backEndRatioLabel") : t("aboveFold.maxTotalMonthlyDebtLabel");
  const heroValue = mode === "ratio" ? percent(ratioResult.backEndRatio) : money(maxDebtResult.maxTotalMonthlyDebt);
  const sentenceKey = mode === "ratio" ? "aboveFold.sentences.ratio" : "aboveFold.sentences.maxDebt";
  const sentence =
    mode === "ratio"
      ? t(sentenceKey, { income: money(monthlyGrossIncome), ratio: percent(ratioResult.backEndRatio), category: t(`aboveFold.category.${ratioResult.category}`) })
      : t(sentenceKey, { income: money(monthlyGrossIncome), target: percent(targetBackEndRatio), maxDebt: money(maxDebtResult.maxTotalMonthlyDebt) });

  const inputRows =
    mode === "ratio"
      ? [{ label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) }]
      : [
          { label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) },
          { label: t("form.targetBackEndRatioLabel"), value: percent(targetBackEndRatio) },
          { label: t("form.existingMonthlyDebtLabel"), value: money(maxDebtResult.currentOtherDebt) },
        ];

  const resultRows =
    mode === "ratio"
      ? [
          { label: t("aboveFold.frontEndRatioLabel"), value: percent(ratioResult.frontEndRatio) },
          { label: t("aboveFold.totalMonthlyDebtLabel"), value: money(ratioResult.totalMonthlyDebt) },
          { label: t("aboveFold.categoryLabel"), value: t(`aboveFold.category.${ratioResult.category}`) },
        ]
      : [{ label: t("aboveFold.maxAdditionalMonthlyDebtLabel"), value: money(maxDebtResult.maxAdditionalMonthlyDebt) }];

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

      <div className="mt-5 grid grid-cols-2 gap-2">
        {mode === "ratio" ? (
          <>
            <Stat title={t("aboveFold.frontEndRatioLabel")} value={percent(ratioResult.frontEndRatio)} />
            <Stat title={t("aboveFold.totalMonthlyDebtLabel")} value={money(ratioResult.totalMonthlyDebt)} />
          </>
        ) : (
          <>
            <Stat title={t("aboveFold.maxAdditionalMonthlyDebtLabel")} value={money(maxDebtResult.maxAdditionalMonthlyDebt)} />
            <Stat title={t("form.existingMonthlyDebtLabel")} value={money(maxDebtResult.currentOtherDebt)} />
          </>
        )}
      </div>
    </SectionCard>
  );
}
