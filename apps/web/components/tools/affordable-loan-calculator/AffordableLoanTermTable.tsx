"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { CurrencyCode } from "@/lib/currency";
import type { TermComparisonRow } from "./types";

type AffordableLoanTermTableProps = {
  hasCalculated: boolean;
  rows: TermComparisonRow[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

export default function AffordableLoanTermTable({ hasCalculated, rows, digitStyle, currency }: AffordableLoanTermTableProps) {
  const t = useTranslations("tools.affordable-loan-calculator");

  if (!hasCalculated || rows.length === 0) {
    return (
      <SectionCard title={t("termTable.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("termChart.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("termTable.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("termTable.intro")}</p>

      <div dir="ltr" className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-4 py-2 text-start font-medium">{t("termTable.columnTerm")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("termTable.columnMonthlyPayment")}</th>
              <th className="px-4 py-2 text-end font-medium">{t("termTable.columnMaxLoan")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.termYears} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{t("termChart.termLabel", { years: row.termYears })}</td>
                <td className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">{money(row.monthlyPaymentForLoan)}</td>
                <td className="px-4 py-2.5 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">{money(row.maxLoanForPayment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
