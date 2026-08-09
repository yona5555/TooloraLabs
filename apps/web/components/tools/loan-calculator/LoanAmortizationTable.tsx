"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import type { LoanAmortizationYear } from "@tooloralabs/tools";

type LoanAmortizationTableProps = {
  amortizationSchedule: LoanAmortizationYear[];
  digitStyle: DigitStyle;
};

function buildCsv(
  schedule: LoanAmortizationYear[],
  headers: { year: string; principal: string; interest: string; balance: string }
): string {
  const rows = [
    [headers.year, headers.principal, headers.interest, headers.balance].join(","),
    ...schedule.map((row) =>
      [row.year, row.principalPaid.toFixed(2), row.interestPaid.toFixed(2), row.endingBalance.toFixed(2)].join(",")
    ),
  ];
  return rows.join("\n");
}

export default function LoanAmortizationTable({ amortizationSchedule, digitStyle }: LoanAmortizationTableProps) {
  const t = useTranslations("tools.loan-calculator");
  const [showFullTable, setShowFullTable] = useState(false);

  if (amortizationSchedule.length === 0) return null;

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const csvContent = buildCsv(amortizationSchedule, {
    year: t("amortizationTable.columnYear"),
    principal: t("payoffChart.principalLabel"),
    interest: t("payoffChart.interestLabel"),
    balance: t("payoffChart.balanceLabel"),
  });

  const visibleRows = showFullTable ? amortizationSchedule : amortizationSchedule.slice(0, 5);
  const remainingYears = amortizationSchedule.length - 5;

  return (
    <SectionCard
      id="amortization"
      title={t("amortizationTable.title")}
      action={
        <DownloadButton
          content={csvContent}
          filename="loan-amortization-schedule.csv"
          mimeType="text/csv;charset=utf-8"
          className="!text-white dark:!text-zinc-200"
        />
      }
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("amortizationTable.intro")}</p>

      <div dir="ltr" className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
              <th className="px-4 py-2 text-start font-medium">{t("amortizationTable.columnYear")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("payoffChart.principalLabel")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("payoffChart.interestLabel")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("payoffChart.balanceLabel")}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.year} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {t("amortizationTable.yearLabel", { year: row.year })}
                </td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.principalPaid)}</td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.interestPaid)}</td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.endingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {remainingYears > 0 && (
        <button
          type="button"
          onClick={() => setShowFullTable((prev) => !prev)}
          aria-expanded={showFullTable}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-800 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          {showFullTable ? t("amortizationTable.showLess") : t("amortizationTable.viewFullTable")}
          <ChevronDown size={16} className={`transition-transform ${showFullTable ? "rotate-180" : ""}`} />
        </button>
      )}
    </SectionCard>
  );
}
