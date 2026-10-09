import { useTranslations } from "next-intl";
import type { BatchInvoice, BatchOverview } from "@tooloralabs/tools";
import type { InvoiceFormatters } from "./format";

type Props = { invoices: BatchInvoice[]; overview: BatchOverview; f: InvoiceFormatters };

/** Print-only copy of the batch: every invoice with its items, then the totals (hidden on screen). */
export default function PrintableSummary({ invoices, overview, f }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator");
  const e = useTranslations("tools.batch-invoice-calculator.export");
  const cell = "border border-zinc-300 px-2 py-1";

  return (
    <div data-print-area className="hidden bg-white p-8 text-black print:block">
      <h1 className="mb-4 text-xl font-bold">{t("title")}</h1>
      {invoices.map((inv, i) => {
        const row = overview.perInvoice[i];
        return (
          <table key={inv.id} className="mb-4 w-full border-collapse text-sm">
            <thead>
              <tr>
                <th colSpan={4} className={`${cell} text-start`}>
                  {inv.number} · {inv.date} · {inv.client}
                </th>
              </tr>
              <tr>
                <th className={`${cell} text-start`}>{e("item")}</th>
                <th className={`${cell} text-end`}>{e("quantity")}</th>
                <th className={`${cell} text-end`}>{e("unitPrice")}</th>
                <th className={`${cell} text-end`}>{e("lineTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it, j) => (
                <tr key={j}>
                  <td className={cell}>{it.name}</td>
                  <td className={`${cell} text-end`}>{f.num(it.quantity)}</td>
                  <td className={`${cell} text-end`}>{f.money(it.unitPrice)}</td>
                  <td className={`${cell} text-end`}>{f.money(row.lineTotals[j])}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className={`${cell} text-end`}>{e("net")} · {e("tax")} ({f.pct(inv.taxPercent, 3)}) · {e("total")}</td>
                <td className={`${cell} text-end font-semibold`}>
                  {f.money(row.subtotal)} · {f.money(row.tax)} · {f.money(row.total)}
                </td>
              </tr>
            </tbody>
          </table>
        );
      })}
      <p className="mt-4 text-base font-bold">
        {e("grandTotal")}: {f.money(overview.grand)} ({e("net")} {f.money(overview.net)} · {e("tax")} {f.money(overview.tax)})
      </p>
    </div>
  );
}
