"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MortgageExtendedResult } from "./types";

type MortgageBiweeklyPaymentProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

function monthsToYearsMonths(totalMonths: number): { years: number; months: number } {
  return { years: Math.floor(totalMonths / 12), months: Math.round(totalMonths) % 12 };
}

function buildCsv(
  schedule: MortgageExtendedResult["biweekly"]["schedule"],
  headers: { number: string; payment: string; principal: string; interest: string; balance: string }
): string {
  const rows = [
    [headers.number, headers.payment, headers.principal, headers.interest, headers.balance].join(","),
    ...schedule.map((row) =>
      [row.period, row.payment.toFixed(2), row.principalPaid.toFixed(2), row.interestPaid.toFixed(2), row.endingBalance.toFixed(2)].join(
        ","
      )
    ),
  ];
  return rows.join("\n");
}

export default function MortgageBiweeklyPayment({ result, digitStyle }: MortgageBiweeklyPaymentProps) {
  const t = useTranslations("tools.mortgage-calculator.biweekly");
  const tPayoff = useTranslations("tools.mortgage-calculator.payoffChart");
  const tAboveFold = useTranslations("tools.mortgage-calculator.aboveFold");

  const { biweekly } = result;

  const csvContent = useMemo(
    () =>
      buildCsv(biweekly.schedule, {
        number: t("columnPaymentNumber"),
        payment: t("columnPayment"),
        principal: tPayoff("principalLabel"),
        interest: tPayoff("interestLabel"),
        balance: tPayoff("balanceLabel"),
      }),
    [biweekly.schedule, t, tPayoff]
  );

  if (biweekly.schedule.length === 0) return null;

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmt = (n: number, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 0 }) =>
    formatLocalizedNumber(n, digitStyle, opts);

  const standardPayoff = monthsToYearsMonths(result.scheduledPayoffMonths);
  const biweeklyPayoff = monthsToYearsMonths(biweekly.payoffMonthsEquivalent);
  const timeSaved = monthsToYearsMonths(biweekly.monthsSavedVsStandard);

  const rows: { label: string; standard: string; biweekly: string }[] = [
    {
      label: t("rowPaymentAmount"),
      standard: currency(result.monthlyPrincipalAndInterest),
      biweekly: currency(biweekly.biweeklyPaymentAmount),
    },
    {
      label: t("rowPaymentsPerYear"),
      standard: fmt(12),
      biweekly: fmt(26),
    },
    {
      label: t("rowPayoffTime"),
      standard: tAboveFold("payoffTimeValue", { years: fmt(standardPayoff.years), months: fmt(standardPayoff.months) }),
      biweekly: tAboveFold("payoffTimeValue", { years: fmt(biweeklyPayoff.years), months: fmt(biweeklyPayoff.months) }),
    },
    {
      label: t("rowTotalInterest"),
      standard: currency(result.totalInterest),
      biweekly: currency(biweekly.totalInterest),
    },
    {
      label: t("rowTotalCost"),
      standard: currency(result.loanAmount + result.totalInterest),
      biweekly: currency(result.loanAmount + biweekly.totalInterest),
    },
  ];

  return (
    <SectionCard
      title={t("title")}
      action={<DownloadButton content={csvContent} filename="mortgage-biweekly-schedule.csv" mimeType="text/csv;charset=utf-8" />}
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("biweeklyPaymentLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(biweekly.biweeklyPaymentAmount)}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400" title={t("interestSavedNote")}>
            {t("interestSavedLabel")}
          </dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(biweekly.interestSavedVsStandard)}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("timeSavedLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {tAboveFold("payoffTimeValue", { years: fmt(timeSaved.years), months: fmt(timeSaved.months) })}
          </dd>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 text-start font-medium text-zinc-500 dark:text-zinc-400"></th>
              <th className="py-2 text-end font-medium text-zinc-500 dark:text-zinc-400">{t("standardLabel")}</th>
              <th className="py-2 text-end font-medium text-zinc-500 dark:text-zinc-400">{t("biweeklyLabel")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{row.label}</td>
                <td dir="ltr" className="py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">
                  {row.standard}
                </td>
                <td dir="ltr" className="py-2.5 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.biweekly}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.monthlyPMIFee > 0 && biweekly.pmiDropoffPeriod && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          {t("pmiNote", { period: biweekly.pmiDropoffPeriod, autoPeriod: biweekly.pmiAutoTerminationPeriod ?? biweekly.pmiDropoffPeriod })}
        </p>
      )}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
