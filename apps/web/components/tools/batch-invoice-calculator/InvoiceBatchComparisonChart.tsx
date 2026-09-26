"use client";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import type { SavedInvoice } from "./types";
import type { BatchInvoiceCalculatorOutput } from "@tooloralabs/tools";

type Props = {
  invoices: SavedInvoice[];
  results: BatchInvoiceCalculatorOutput[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
  netLabel: string;
  taxLabel: string;
  caption: string;
};

const BAR_HEIGHT = 22;
const BAR_GAP = 10;
const MAX_BARS = 8;

/**
 * A real, live composition comparison across the saved invoices — each bar is
 * split into its own actual net/tax portions (not a decorative total-only
 * bar), so a batch of invoices with very different tax rates is visually
 * distinguishable, not just their grand totals.
 */
export default function InvoiceBatchComparisonChart({ invoices, results, digitStyle, currency, netLabel, taxLabel, caption }: Props) {
  if (invoices.length < 2) return null;

  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const rows = invoices.slice(-MAX_BARS).map((invoice, idx) => {
    const resultIndex = invoices.length - Math.min(invoices.length, MAX_BARS) + idx;
    return { invoice, result: results[resultIndex] };
  });

  const maxTotal = Math.max(...rows.map((r) => r.result?.total ?? 0), 1);
  const LEFT_MARGIN = 90;
  // Widened from 60: a currency-coded value (e.g. "AED 12,345") runs longer than a bare number.
  const RIGHT_MARGIN = 84;
  const chartWidth = 230;
  const viewBoxWidth = LEFT_MARGIN + chartWidth + RIGHT_MARGIN;
  const height = rows.length * (BAR_HEIGHT + BAR_GAP) + BAR_GAP;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${viewBoxWidth} ${height}`} width="100%" className="max-w-full" style={{ minWidth: 280 }}>
          {rows.map((row, i) => {
            const total = row.result?.total ?? 0;
            const net = row.result?.subtotal ?? 0;
            const barWidth = maxTotal > 0 ? (total / maxTotal) * chartWidth : 0;
            const netWidth = total > 0 ? (net / total) * barWidth : 0;
            const taxWidth = barWidth - netWidth;
            const y = BAR_GAP + i * (BAR_HEIGHT + BAR_GAP);
            const label = row.invoice.invoiceNumber || row.invoice.vendor || `#${i + 1}`;

            return (
              <g key={row.invoice.id}>
                <text x={0} y={y + BAR_HEIGHT / 2 + 4} className="fill-zinc-600 dark:fill-zinc-300" style={{ fontSize: 10, fontWeight: 600 }}>
                  {label.length > 12 ? `${label.slice(0, 11)}…` : label}
                </text>
                <rect x={LEFT_MARGIN} y={y} width={netWidth} height={BAR_HEIGHT} rx={3} className="fill-blue-600 dark:fill-blue-500" />
                <rect x={LEFT_MARGIN + netWidth} y={y} width={taxWidth} height={BAR_HEIGHT} rx={3} className="fill-amber-400 dark:fill-amber-500" />
                <text x={LEFT_MARGIN + barWidth + 6} y={y + BAR_HEIGHT / 2 + 4} className="fill-zinc-700 dark:fill-zinc-200" style={{ fontSize: 10, fontWeight: 700 }}>
                  {fmt(total)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 dark:bg-blue-500" /> {netLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" /> {taxLabel}
        </span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
