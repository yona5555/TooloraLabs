"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import type { LoanGrowthRow } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";

type LoanGrowthTableProps = {
  schedule: LoanGrowthRow[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

function buildCsv(schedule: LoanGrowthRow[], headers: { year: string; interest: string; balance: string }): string {
  const rows = [
    [headers.year, headers.interest, headers.balance].join(","),
    ...schedule.map((row) => [row.year, row.interestAccrued.toFixed(2), row.endingBalance.toFixed(2)].join(",")),
  ];
  return rows.join("\n");
}

const COLLAPSED_ROW_COUNT = 8;

export default function LoanGrowthTable({ schedule, digitStyle, currency }: LoanGrowthTableProps) {
  const t = useTranslations("tools.loan-calculator");
  const [expanded, setExpanded] = useState(false);

  if (schedule.length === 0) return null;

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const csvContent = buildCsv(schedule, {
    year: t("amortizationTable.columnYear"),
    interest: t("payoffChart.interestLabel"),
    balance: t("payoffChart.balanceLabel"),
  });

  return (
    <SectionCard
      id="amortization"
      title={t("amortizationTable.title")}
      action={<DownloadButton content={csvContent} filename="loan-growth-schedule.csv" mimeType="text/csv;charset=utf-8" className="!text-white dark:!text-zinc-200" />}
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("amortizationTable.growthIntro")}</p>

      <div dir="ltr" className="mt-4 max-h-[560px] overflow-y-auto overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[360px] text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/90">
            <tr className="text-xs text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 text-start font-medium">{t("amortizationTable.columnYear")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("payoffChart.interestLabel")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("payoffChart.balanceLabel")}</th>
            </tr>
          </thead>
          <tbody>
            {(expanded ? schedule : schedule.slice(0, COLLAPSED_ROW_COUNT)).map((row) => (
              <tr key={row.year} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{formatLocalizedNumber(row.year, digitStyle, { maximumFractionDigits: 1 })}</td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{money(row.interestAccrued)}</td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{money(row.endingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {schedule.length > COLLAPSED_ROW_COUNT && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          {expanded ? t("amortizationTable.showLess") : t("amortizationTable.viewFullTable")}
        </button>
      )}
    </SectionCard>
  );
}
