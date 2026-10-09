"use client";
import { useTranslations } from "next-intl";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { invoiceTotals, type BatchInvoice, type BatchOverview } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useCountUp, type InvoiceFormatters } from "./format";

type Props = {
  invoice: BatchInvoice | null;
  overview: BatchOverview;
  f: InvoiceFormatters;
  onPrint: () => void;
  onCsv: () => void;
  onExcel: () => void;
};

function Counter({ value, f, className, testId }: { value: number; f: InvoiceFormatters; className: string; testId?: string }) {
  const shown = useCountUp(value);
  return (
    <span dir="ltr" className={className} data-testid={testId} data-value={f.money(value)}>
      {f.money(shown)}
    </span>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
      <div className="flex flex-col items-center">
        <div className="h-3 w-1 rounded bg-blue-500/70" />
        <div className="h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-blue-500" />
      </div>
      <span dir="ltr" className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm">
        {label}
      </span>
    </div>
  );
}

/** §31 type 2: the selected invoice flowing items → subtotal → tax → total, then the whole batch's grand total. */
export default function InvoiceFlowResult({ invoice, overview, f, onPrint, onCsv, onExcel }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.flow");
  const totals = invoice ? invoiceTotals(invoice) : null;
  const maxLine = totals ? Math.max(...totals.lineTotals, 1e-9) : 1;
  const btn = "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-blue-400";

  return (
    <SectionCard
      id="result"
      title={t("title")}
      action={
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white" data-testid="live-badge">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          {t("live")}
        </span>
      }
      bodyClassName="p-4"
    >
      {invoice && totals ? (
        <>
          <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {[invoice.number, invoice.client].filter(Boolean).join(" · ") || t("thisInvoice")}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

          <ul className="mt-3 space-y-1.5 rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700" data-testid="flow-items">
            {invoice.items.map((item, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2">
                <span className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                  {item.name || "—"} <span dir="ltr" className="font-mono text-[10px] text-zinc-400">{f.num(item.quantity)} × {f.money(item.unitPrice)}</span>
                </span>
                <span dir="ltr" className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {f.money(totals.lineTotals[i])}
                </span>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${(totals.lineTotals[i] / maxLine) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <Arrow label={`Σ ${f.num(invoice.items.length, 0)}`} />
          <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-500/30 dark:bg-sky-500/10">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("subtotal")}</span>
            <Counter value={totals.subtotal} f={f} className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100" testId="flow-subtotal" />
          </div>
          <Arrow label={`× ${f.pct(Math.max(0, invoice.taxPercent), 3)}`} />
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("tax")}</span>
            <Counter value={totals.tax} f={f} className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100" testId="flow-tax" />
          </div>
          <Arrow label="+" />
          <div className="flex items-center justify-between rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2.5 dark:bg-blue-500/10">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t("total")}</span>
            <Counter value={totals.total} f={f} className="font-mono text-xl font-bold text-blue-700 dark:text-blue-300" testId="flow-total" />
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("empty")}</p>
      )}

      <div className="mt-4 rounded-xl bg-zinc-900 p-4 text-white dark:bg-zinc-800">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{t("grandTotal", { count: overview.invoiceCount })}</p>
        <Counter value={overview.grand} f={f} className="block truncate font-mono text-3xl font-bold" testId="grand-total" />
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            [t("net"), f.money(overview.net)],
            [t("taxTotal"), f.money(overview.tax)],
            [t("blended"), f.pct(overview.effectiveTaxRate, 2)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0 rounded-lg bg-white/10 px-1.5 py-1.5">
              <dt className="truncate text-[10px] text-zinc-300">{k}</dt>
              <dd dir="ltr" className="truncate font-mono text-xs font-semibold">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-3 flex gap-2 print:hidden">
        <button type="button" className={btn} onClick={onPrint} data-testid="export-print">
          <Printer size={14} />
          {t("print")}
        </button>
        <button type="button" className={btn} onClick={onCsv} disabled={!overview.invoiceCount} data-testid="export-csv">
          <FileText size={14} />
          CSV
        </button>
        <button type="button" className={btn} onClick={onExcel} disabled={!overview.invoiceCount} data-testid="export-xlsx">
          <FileSpreadsheet size={14} />
          Excel
        </button>
      </div>
    </SectionCard>
  );
}
