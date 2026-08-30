"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import MortgageShareExportModal from "./MortgageShareExportModal";
import type { MortgageExtendedResult } from "./types";

type MortgagePayoffTimeResultProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function monthsToYearsMonths(totalMonths: number): { years: number; months: number } {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export default function MortgagePayoffTimeResult({ result, digitStyle }: MortgagePayoffTimeResultProps) {
  const t = useTranslations("tools.mortgage-calculator");

  const currency = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmt = (n: number) => formatLocalizedNumber(n, digitStyle, { maximumFractionDigits: 0 });

  const hasExtra = result.extraMonthlyPayment > 0;
  const actual = monthsToYearsMonths(result.actualPayoffMonths);
  const standard = monthsToYearsMonths(result.scheduledPayoffMonths);
  const saved = monthsToYearsMonths(result.monthsSavedByExtraPayment);

  const heroLabel = hasExtra ? t("payoffTimeResult.heroLabelWithExtra") : t("payoffTimeResult.heroLabel");
  const heroValue = t("aboveFold.payoffTimeValue", { years: fmt(actual.years), months: fmt(actual.months) });

  const sentence = hasExtra
    ? t("payoffTimeResult.sentenceWithExtra", {
        extra: currency(result.extraMonthlyPayment),
        standardYears: fmt(standard.years),
        standardMonths: fmt(standard.months),
        years: fmt(actual.years),
        months: fmt(actual.months),
        interestSaved: currency(result.interestSavedByExtraPayment),
      })
    : t("payoffTimeResult.sentenceNoExtra", {
        years: fmt(actual.years),
        months: fmt(actual.months),
        termYears: fmt(result.loanTermYears),
      });

  const inputRows = [
    { label: t("form.homePrice"), value: currency(result.homePrice) },
    { label: t("aboveFold.loanAmountLabel"), value: currency(result.loanAmount) },
    { label: t("form.interestRate"), value: `${fmt(result.annualInterestRate)}%` },
    { label: t("form.loanTerm"), value: t("form.loanTermPreset", { years: fmt(result.loanTermYears) }) },
    { label: t("form.extraMonthlyPayment"), value: currency(result.extraMonthlyPayment) },
  ];
  const resultRows = [
    { label: t("payoffTimeResult.standardPayoffLabel"), value: t("aboveFold.payoffTimeValue", { years: fmt(standard.years), months: fmt(standard.months) }) },
    { label: t("payoffTimeResult.totalInterestLabel"), value: currency(result.actualTotalInterest) },
    ...(hasExtra
      ? [
          { label: t("payoffTimeResult.monthsSavedLabel"), value: t("aboveFold.payoffTimeValue", { years: fmt(saved.years), months: fmt(saved.months) }) },
          { label: t("payoffTimeResult.interestSavedLabel"), value: currency(result.interestSavedByExtraPayment) },
        ]
      : []),
  ];

  const scheduleTable = {
    title: t("shareExport.scheduleTableTitle"),
    columns: [t("payoffChart.tooltipYearLabel"), t("payoffChart.principalLabel"), t("payoffChart.interestLabel"), t("payoffChart.balanceLabel")],
    rows: result.amortizationSchedule.map((row) => [String(row.year), currency(row.principalPaid), currency(row.interestPaid), currency(row.endingBalance)]),
  };

  return (
    <SectionCard
      title={t("payoffTimeResult.resultTitle")}
      action={<MortgageShareExportModal mode="payoffTime" inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} table={scheduleTable} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <StatTile label={t("payoffTimeResult.standardPayoffLabel")} value={t("aboveFold.payoffTimeValue", { years: fmt(standard.years), months: fmt(standard.months) })} />
        <StatTile label={t("payoffTimeResult.totalInterestLabel")} value={currency(result.actualTotalInterest)} />
        {hasExtra && (
          <>
            <StatTile label={t("payoffTimeResult.monthsSavedLabel")} value={t("aboveFold.payoffTimeValue", { years: fmt(saved.years), months: fmt(saved.months) })} />
            <StatTile label={t("payoffTimeResult.interestSavedLabel")} value={currency(result.interestSavedByExtraPayment)} />
          </>
        )}
      </dl>
    </SectionCard>
  );
}
