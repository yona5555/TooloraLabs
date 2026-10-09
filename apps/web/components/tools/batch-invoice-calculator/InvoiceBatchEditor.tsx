"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, FilePlus2, RotateCcw, Sparkles, Trash2, Plus } from "lucide-react";
import { invoiceTotals, lineTotal } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { VAT_TABLE, toBatch, type DraftInvoice, type DraftItem } from "./types";
import type { InvoiceFormatters } from "./format";

type Props = {
  invoices: DraftInvoice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currency: string;
  currencies: string[];
  onCurrencyChange: (code: string) => void;
  onAddInvoice: () => void;
  onDuplicateInvoice: (id: string) => void;
  onRemoveInvoice: (id: string) => void;
  onUpdateInvoice: (id: string, patch: Partial<Omit<DraftInvoice, "id" | "items">>) => void;
  onAddItem: (invoiceId: string) => void;
  onUpdateItem: (invoiceId: string, itemId: string, patch: Partial<Omit<DraftItem, "id">>) => void;
  onDuplicateItem: (invoiceId: string, itemId: string) => void;
  onRemoveItem: (invoiceId: string, itemId: string) => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  onApplyRate: (rate: number) => void;
  f: InvoiceFormatters;
};

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const iconBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

/**
 * §33 hierarchy: the batch (level 1) holds invoices shown as tabs (level 2); the selected invoice's
 * line items (level 3) are edited in place with their line totals updating while typing.
 */
export default function InvoiceBatchEditor(p: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.editor");
  const locale = useLocale();
  const { f } = p;
  const invoice = p.invoices.find((i) => i.id === p.selectedId) ?? null;
  const totals = useMemo(() => toBatch(p.invoices).map((inv) => invoiceTotals(inv).total), [p.invoices]);
  const names = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale], { type: "currency" });
    } catch {
      dn = null;
    }
    return (code: string) => dn?.of(code) ?? code;
  }, [locale]);
  const regions = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      dn = null;
    }
    return (code: string) => dn?.of(code) ?? code;
  }, [locale]);
  const selectedNet = invoice ? invoiceTotals(toBatch([invoice])[0]).subtotal : 0;

  return (
    <SectionCard title={t("title")} className="flex h-full flex-col" bodyClassName="flex min-h-0 flex-1 flex-col p-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={p.onLoadSample} data-testid="load-sample" className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-blue-400">
          <Sparkles size={13} />
          {t("loadSample")}
        </button>
        <button type="button" onClick={p.onClearAll} data-testid="clear-all" className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-red-400">
          <RotateCcw size={13} />
          {t("clearAll")}
        </button>
      </div>

      <label className="mt-3 block">
        <span className={label}>{t("currency")}</span>
        <select value={p.currency} onChange={(e) => p.onCurrencyChange(e.target.value)} className={field} data-testid="currency-select">
          {p.currencies.map((c) => (
            <option key={c} value={c}>
              {c} — {names(c)}
            </option>
          ))}
        </select>
      </label>

      <p className={`${label} mt-4`}>{t("invoices", { count: p.invoices.length })}</p>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("invoices", { count: p.invoices.length })}>
        {p.invoices.map((inv, i) => (
          <button
            key={inv.id}
            type="button"
            role="tab"
            aria-selected={inv.id === p.selectedId}
            onClick={() => p.onSelect(inv.id)}
            className={`flex min-w-0 flex-col rounded-lg border px-2.5 py-1.5 text-start transition ${
              inv.id === p.selectedId ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-300 hover:border-blue-400 dark:border-zinc-700"
            }`}
          >
            <span className="max-w-[7.5rem] truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">{inv.number || t("untitled", { n: i + 1 })}</span>
            <span dir="ltr" className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
              {f.money(totals[i] ?? 0)}
            </span>
          </button>
        ))}
        <button type="button" onClick={p.onAddInvoice} data-testid="add-invoice" className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10">
          <FilePlus2 size={14} />
          {t("addInvoice")}
        </button>
      </div>

      {invoice ? (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-700 dark:bg-zinc-800/30" data-testid="invoice-editor">
          <div className="grid grid-cols-2 gap-2">
            <label className="min-w-0">
              <span className={label}>{t("number")}</span>
              <input className={field} value={invoice.number} onChange={(e) => p.onUpdateInvoice(invoice.id, { number: e.target.value })} placeholder="INV-1004" />
            </label>
            <label className="min-w-0">
              <span className={label}>{t("date")}</span>
              <input type="date" dir="ltr" className={`${field} px-1.5`} value={invoice.date} onChange={(e) => p.onUpdateInvoice(invoice.id, { date: e.target.value })} />
            </label>
            <label className="min-w-0">
              <span className={label}>{t("client")}</span>
              <input className={field} value={invoice.client} onChange={(e) => p.onUpdateInvoice(invoice.id, { client: e.target.value })} placeholder={t("clientPlaceholder")} data-testid="client-input" />
            </label>
            <label className="min-w-0">
              <span className={label}>{t("tax")}</span>
              <input className={field} inputMode="decimal" dir="ltr" value={invoice.taxPercent} onChange={(e) => p.onUpdateInvoice(invoice.id, { taxPercent: e.target.value })} data-testid="tax-input" />
            </label>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => p.onDuplicateInvoice(invoice.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Copy size={13} />
              {t("duplicateInvoice")}
            </button>
            <button type="button" onClick={() => p.onRemoveInvoice(invoice.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 py-1.5 text-xs font-semibold text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300">
              <Trash2 size={13} />
              {t("removeInvoice")}
            </button>
          </div>

          <p className={`${label} mt-3`}>{t("items", { count: invoice.items.length })}</p>
          <ul className="space-y-2">
            {invoice.items.map((item, idx) => {
              const total = lineTotal(toBatch([{ ...invoice, items: [item] }])[0].items[0]);
              return (
                <li key={item.id} className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900" data-testid="line-item">
                  <div className="flex items-center gap-1.5">
                    <input className={`${field} py-1.5`} value={item.name} aria-label={t("itemName")} placeholder={t("itemPlaceholder", { n: idx + 1 })} onChange={(e) => p.onUpdateItem(invoice.id, item.id, { name: e.target.value })} />
                    <button type="button" className={iconBtn} aria-label={t("duplicateItem")} title={t("duplicateItem")} onClick={() => p.onDuplicateItem(invoice.id, item.id)}>
                      <Copy size={14} />
                    </button>
                    <button type="button" className={iconBtn} aria-label={t("removeItem")} title={t("removeItem")} disabled={invoice.items.length <= 1} onClick={() => p.onRemoveItem(invoice.id, item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-1.5 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)] items-end gap-1.5">
                    <label className="min-w-0">
                      <span className="block text-[10px] text-zinc-400">{t("qty")}</span>
                      <input className={`${field} py-1.5`} inputMode="decimal" dir="ltr" value={item.quantity} onChange={(e) => p.onUpdateItem(invoice.id, item.id, { quantity: e.target.value })} data-testid="qty-input" />
                    </label>
                    <label className="min-w-0">
                      <span className="block text-[10px] text-zinc-400">{t("price")}</span>
                      <input className={`${field} py-1.5`} inputMode="decimal" dir="ltr" value={item.unitPrice} onChange={(e) => p.onUpdateItem(invoice.id, item.id, { unitPrice: e.target.value })} data-testid="price-input" />
                    </label>
                    <div className="min-w-0 text-end">
                      <span className="block text-[10px] text-zinc-400">{t("lineTotal")}</span>
                      <span dir="ltr" className="block truncate py-1.5 font-mono text-sm font-bold text-blue-700 dark:text-blue-300" data-testid="line-total">
                        {f.money(total)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => p.onAddItem(invoice.id)} data-testid="add-item" className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10">
            <Plus size={14} />
            {t("addItem")}
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400" data-testid="empty-batch">
          {t("empty")}
        </div>
      )}
      <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">{t("savedNote")}</p>

      {/* §20 quick picks: fills the rest of the column with real rates, each pricing the selected invoice. */}
      <div className="mt-3 flex min-h-[11rem] flex-1 flex-col">
        <p className={label}>{t("quickRates")}</p>
        <div className="relative min-h-0 flex-1">
          <ul className="absolute inset-0 divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700" data-testid="quick-rates">
            {VAT_TABLE.filter((r) => r.rate !== null).map((r) => (
              <li key={r.country}>
                <button type="button" disabled={!invoice} onClick={() => p.onApplyRate(r.rate!)} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-start transition hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10">
                  <span className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-300">{regions(r.country)}</span>
                  <span dir="ltr" className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{f.pct(r.rate!, 2)}</span>
                  <span dir="ltr" className="w-20 truncate text-end font-mono text-[10px] text-zinc-500">{f.money(selectedNet * (1 + r.rate! / 100))}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-1 text-[10px] text-zinc-400">{t("quickRatesNote")}</p>
      </div>
    </SectionCard>
  );
}
