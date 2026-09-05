import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { SavedInvoice } from "./types";

type Props = {
  invoices: SavedInvoice[];
  totals: number[];
  digitStyle: DigitStyle;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function InvoiceTable({ invoices, totals, digitStyle, onEdit, onDelete }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.table");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-start dark:border-zinc-800 dark:bg-zinc-800/50">
            <th className="px-4 py-3 text-start font-semibold text-zinc-600 dark:text-zinc-300">{t("columnNumber")}</th>
            <th className="px-4 py-3 text-start font-semibold text-zinc-600 dark:text-zinc-300">{t("columnDate")}</th>
            <th className="px-4 py-3 text-start font-semibold text-zinc-600 dark:text-zinc-300">{t("columnVendor")}</th>
            <th className="px-4 py-3 text-end font-semibold text-zinc-600 dark:text-zinc-300">{t("columnTotal")}</th>
            <th className="px-4 py-3 text-end font-semibold text-zinc-600 dark:text-zinc-300">{t("columnActions")}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, i) => (
            <tr key={invoice.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              <td className="px-4 py-2.5">{invoice.invoiceNumber || t("noNumber")}</td>
              <td className="px-4 py-2.5">{invoice.date}</td>
              <td className="px-4 py-2.5">{invoice.vendor || t("noVendor")}</td>
              <td className="px-4 py-2.5 text-end font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                {fmt(totals[i] ?? 0)}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(invoice.id)}
                    aria-label={t("editInvoice")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(invoice.id)}
                    aria-label={t("deleteInvoice")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
