"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { YearlyGrowthPoint } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CompoundInterestBreakdownDonut from "./CompoundInterestBreakdownDonut";
import CompoundInterestShareExportModal from "./CompoundInterestShareExportModal";
import type { CompoundingFrequency, SolveMode } from "./types";

type CompoundInterestResultProps = {
  mode: SolveMode;
  hasCalculated: boolean;
  futureValue: number;
  principal: number;
  totalContributions: number;
  totalInterest: number;
  resolvedRate: number;
  resolvedYears: number;
  resolvedContribution: number;
  targetAmount: number;
  unreachable: boolean;
  digitStyle: DigitStyle;
  inflationRate?: number;
  buyingPowerAfterInflation?: number;
  frequency: CompoundingFrequency;
  yearlySchedule: YearlyGrowthPoint[];
};

export default function CompoundInterestResult({
  mode,
  hasCalculated,
  futureValue,
  principal,
  totalContributions,
  totalInterest,
  resolvedRate,
  resolvedYears,
  resolvedContribution,
  targetAmount,
  unreachable,
  digitStyle,
  inflationRate = 0,
  buyingPowerAfterInflation = 0,
  frequency,
  yearlySchedule,
}: CompoundInterestResultProps) {
  const t = useTranslations("tools.compound-interest-calculator");

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

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const percent = (value: number) =>
    formatLocalizedNumber(value / 100, digitStyle, { style: "percent", maximumFractionDigits: 2 });
  const yearsText = (value: number) =>
    `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })} ${t("aboveFold.yearsUnit")}`;

  const heroLabel =
    mode === "endAmount"
      ? t("aboveFold.futureValueLabel")
      : mode === "investmentLength"
        ? t("aboveFold.resultLabels.years")
        : mode === "returnRate"
          ? t("aboveFold.resultLabels.rate")
          : mode === "startingAmount"
            ? t("aboveFold.resultLabels.principal")
            : t("aboveFold.resultLabels.contribution");

  const heroValue = unreachable
    ? "—"
    : mode === "endAmount"
      ? currency(futureValue)
      : mode === "investmentLength"
        ? yearsText(resolvedYears)
        : mode === "returnRate"
          ? percent(resolvedRate)
          : mode === "startingAmount"
            ? currency(principal)
            : currency(resolvedContribution);

  const sentenceKey = unreachable ? `aboveFold.sentences.${mode}Unreachable` : `aboveFold.sentences.${mode}`;
  const sentence = t(sentenceKey, {
    principal: currency(principal),
    rate: percent(resolvedRate),
    years: yearsText(resolvedYears),
    contribution: currency(resolvedContribution),
    target: currency(targetAmount),
    result: currency(futureValue),
  });

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <CompoundInterestShareExportModal
          mode={mode}
          digitStyle={digitStyle}
          principal={principal}
          rate={resolvedRate}
          years={resolvedYears}
          frequency={frequency}
          contribution={resolvedContribution}
          targetAmount={targetAmount}
          totalContributions={totalContributions}
          totalInterest={totalInterest}
          yearlySchedule={yearlySchedule}
          unreachable={unreachable}
          heroLabel={heroLabel}
          heroValue={heroValue}
          sentence={sentence}
        />
      }
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      {mode === "endAmount" && inflationRate > 0 && (
        <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {t("aboveFold.buyingPowerLabel")}:{" "}
          <span dir="ltr" className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {currency(buyingPowerAfterInflation)}
          </span>
        </p>
      )}

      <div className="mt-5">
        <CompoundInterestBreakdownDonut
          centerValue={currency(futureValue)}
          centerLabel={t("aboveFold.futureValueLabel")}
          segments={[
            { key: "principal", value: principal, label: t("aboveFold.principalLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "contributions", value: totalContributions, label: t("aboveFold.contributionsLabel"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
            { key: "interest", value: totalInterest, label: t("aboveFold.interestLabel"), colorClass: "stroke-amber-400 dark:stroke-amber-500" },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.principalLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(principal)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.contributionsLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(totalContributions)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.interestLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
            {currency(totalInterest)}
          </dd>
        </div>
      </div>
    </SectionCard>
  );
}
