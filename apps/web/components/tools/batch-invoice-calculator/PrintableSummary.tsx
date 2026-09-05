import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BatchSummary } from "@tooloralabs/tools";
import type { SavedInvoice } from "./types";

type Props = {
  invoices: SavedInvoice[];
  totals: number[];
  summary: BatchSummary;
  digitStyle: DigitStyle;
};

export default function PrintableSummary({ invoices, totals, summary, digitStyle }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator");
  const tTable = useTranslations("tools.batch-invoice-calculator.table");
  const tSummary = useTranslations("tools.batch-invoice-calculator.summary");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  return (
    <div data-print-area className="hidden bg-white p-8 text-black print:block">
      <h1 className="mb-4 text-xl font-bold">{t("title")}</h1>
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-zinc-300 px-3 py-2 text-start">{tTable("columnNumber")}</th>
            <th className="border border-zinc-300 px-3 py-2 text-start">{tTable("columnDate")}</th>
            <th className="border border-zinc-300 px-3 py-2 text-start">{tTable("columnVendor")}</th>
            <th className="border border-zinc-300 px-3 py-2 text-end">{tTable("columnTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, i) => (
            <tr key={invoice.id}>
              <td className="border border-zinc-300 px-3 py-2">{invoice.invoiceNumber || tTable("noNumber")}</td>
              <td className="border border-zinc-300 px-3 py-2">{invoice.date}</td>
              <td className="border border-zinc-300 px-3 py-2">{invoice.vendor || tTable("noVendor")}</td>
              <td className="border border-zinc-300 px-3 py-2 text-end font-mono">{fmt(totals[i] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="mt-6 w-full max-w-sm border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-zinc-300 px-3 py-2">{tSummary("invoiceCountLabel")}</td>
            <td className="border border-zinc-300 px-3 py-2 text-end font-mono">{summary.invoiceCount}</td>
          </tr>
          <tr>
            <td className="border border-zinc-300 px-3 py-2">{tSummary("netBeforeTaxLabel")}</td>
            <td className="border border-zinc-300 px-3 py-2 text-end font-mono">{fmt(summary.netBeforeTax)}</td>
          </tr>
          <tr>
            <td className="border border-zinc-300 px-3 py-2">{tSummary("taxTotalLabel")}</td>
            <td className="border border-zinc-300 px-3 py-2 text-end font-mono">{fmt(summary.taxTotal)}</td>
          </tr>
          <tr>
            <td className="border border-zinc-300 px-3 py-2 font-bold">{tSummary("grandTotalLabel")}</td>
            <td className="border border-zinc-300 px-3 py-2 text-end font-mono font-bold">{fmt(summary.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
