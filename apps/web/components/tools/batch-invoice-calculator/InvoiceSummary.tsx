"use client";
import { useTranslations } from "next-intl";
import { Printer, Trash2 } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BatchSummary } from "@tooloralabs/tools";

type Props = {
  summary: BatchSummary;
  digitStyle: DigitStyle;
  onPrint: () => void;
  onClearAll: () => void;
};

export default function InvoiceSummary({ summary, digitStyle, onPrint, onClearAll }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.summary");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("invoiceCountLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{summary.invoiceCount}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("netBeforeTaxLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(summary.netBeforeTax)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("taxTotalLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(summary.taxTotal)}</span>
          </li>
          <li className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-1.5 dark:border-zinc-800">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t("grandTotalLabel")}</span>
            <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{fmt(summary.grandTotal)}</span>
          </li>
        </ul>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onPrint}
            disabled={summary.invoiceCount === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Printer size={16} />
            {t("printExport")}
          </button>
          <button
            type="button"
            onClick={onClearAll}
            disabled={summary.invoiceCount === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            {t("clearAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
