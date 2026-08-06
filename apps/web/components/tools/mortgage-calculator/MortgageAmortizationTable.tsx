"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import type { MortgageExtendedResult } from "./types";

type MortgageAmortizationTableProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

type YearGroup = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  months: MortgageExtendedResult["monthlySchedule"];
};

function groupByYear(monthlySchedule: MortgageExtendedResult["monthlySchedule"]): YearGroup[] {
  const groups = new Map<number, YearGroup>();

  for (const row of monthlySchedule) {
    const existing = groups.get(row.year);
    if (existing) {
      existing.principalPaid += row.principalPaid;
      existing.interestPaid += row.interestPaid;
      existing.endingBalance = row.endingBalance;
      existing.months.push(row);
    } else {
      groups.set(row.year, {
        year: row.year,
        principalPaid: row.principalPaid,
        interestPaid: row.interestPaid,
        endingBalance: row.endingBalance,
        months: [row],
      });
    }
  }

  return Array.from(groups.values());
}

function buildCsv(
  monthlySchedule: MortgageExtendedResult["monthlySchedule"],
  headers: { number: string; year: string; payment: string; principal: string; interest: string; balance: string }
): string {
  const rows = [
    [headers.number, headers.year, headers.payment, headers.principal, headers.interest, headers.balance].join(","),
    ...monthlySchedule.map((row) =>
      [row.month, row.year, row.payment.toFixed(2), row.principalPaid.toFixed(2), row.interestPaid.toFixed(2), row.endingBalance.toFixed(2)].join(
        ","
      )
    ),
  ];
  return rows.join("\n");
}

export default function MortgageAmortizationTable({ result, digitStyle }: MortgageAmortizationTableProps) {
  const t = useTranslations("tools.mortgage-calculator");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const yearGroups = useMemo(() => groupByYear(result.monthlySchedule), [result.monthlySchedule]);

  if (yearGroups.length === 0) return null;

  function toggleYear(year: number) {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const currencyPrecise = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const csvContent = buildCsv(result.monthlySchedule, {
    number: t("amortizationTable.columnPaymentNumber"),
    year: t("amortizationTable.columnYear"),
    payment: t("amortizationTable.columnPayment"),
    principal: t("payoffChart.principalLabel"),
    interest: t("payoffChart.interestLabel"),
    balance: t("payoffChart.balanceLabel"),
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{t("amortizationTable.title")}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("amortizationTable.intro")}</p>
        </div>
        <DownloadButton content={csvContent} filename="mortgage-amortization-schedule.csv" mimeType="text/csv;charset=utf-8" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {yearGroups.map((group, index) => {
          const isExpanded = expandedYears.has(group.year);
          return (
            <div key={group.year} className={index !== 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""}>
              <button
                type="button"
                onClick={() => toggleYear(group.year)}
                aria-expanded={isExpanded}
                className="flex w-full flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 text-start transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {t("amortizationTable.yearLabel", { year: group.year })}
                </span>
                <span dir="ltr" className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {t("payoffChart.principalLabel")}: {currency(group.principalPaid)}
                  </span>
                  <span>
                    {t("payoffChart.interestLabel")}: {currency(group.interestPaid)}
                  </span>
                  <span>
                    {t("payoffChart.balanceLabel")}: {currency(group.endingBalance)}
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div dir="ltr" className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                        <th className="px-4 py-2 text-start font-medium">{t("amortizationTable.columnPaymentNumber")}</th>
                        <th className="px-4 py-2 text-end font-medium">{t("amortizationTable.columnPayment")}</th>
                        <th className="px-4 py-2 text-end font-medium">{t("payoffChart.principalLabel")}</th>
                        <th className="px-4 py-2 text-end font-medium">{t("payoffChart.interestLabel")}</th>
                        <th className="px-4 py-2 text-end font-medium">{t("payoffChart.balanceLabel")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.months.map((row) => (
                        <tr key={row.month} className="border-t border-zinc-100 dark:border-zinc-800/60">
                          <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.month}</td>
                          <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                            {currencyPrecise(row.payment)}
                          </td>
                          <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                            {currencyPrecise(row.principalPaid)}
                          </td>
                          <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                            {currencyPrecise(row.interestPaid)}
                          </td>
                          <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                            {currencyPrecise(row.endingBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
