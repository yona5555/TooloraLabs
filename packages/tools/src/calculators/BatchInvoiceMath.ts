/**
 * Batch-wide invoice analytics for the Batch Invoice Calculator's indicators. Pure and framework-
 * agnostic: every function takes the visitor's own invoices and returns plain numbers.
 */

export type BatchLineItem = { name: string; quantity: number; unitPrice: number };

export type BatchInvoice = {
  id: string;
  number: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  client: string;
  taxPercent: number;
  items: BatchLineItem[];
};

export type InvoiceTotals = { lineTotals: number[]; subtotal: number; tax: number; total: number };

const safe = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

/** One line: quantity × unit price, with blank or negative fields counted as zero. */
export const lineTotal = (item: BatchLineItem) => safe(item.quantity) * safe(item.unitPrice);

/** Items → subtotal → tax at the invoice's own rate (a negative rate counts as 0) → total. */
export function invoiceTotals(invoice: Pick<BatchInvoice, "items" | "taxPercent">, taxShift = 0): InvoiceTotals {
  const lineTotals = invoice.items.map(lineTotal);
  const subtotal = lineTotals.reduce((s, v) => s + v, 0);
  const rate = Math.max(0, safe(invoice.taxPercent) + taxShift);
  const tax = subtotal * (rate / 100);
  return { lineTotals, subtotal, tax, total: subtotal + tax };
}

export type BatchOverview = {
  invoiceCount: number;
  itemCount: number;
  net: number;
  tax: number;
  grand: number;
  averageInvoice: number;
  /** Tax as a share of net across the batch (the blended rate), in percent. */
  effectiveTaxRate: number;
  perInvoice: (InvoiceTotals & { id: string; number: string; date: string; client: string; taxPercent: number })[];
};

export function batchOverview(invoices: BatchInvoice[], taxShift = 0): BatchOverview {
  const perInvoice = invoices.map((inv) => ({ ...invoiceTotals(inv, taxShift), id: inv.id, number: inv.number, date: inv.date, client: inv.client, taxPercent: inv.taxPercent }));
  const net = perInvoice.reduce((s, r) => s + r.subtotal, 0);
  const tax = perInvoice.reduce((s, r) => s + r.tax, 0);
  const grand = net + tax;
  return {
    invoiceCount: invoices.length,
    itemCount: invoices.reduce((s, inv) => s + inv.items.length, 0),
    net,
    tax,
    grand,
    averageInvoice: invoices.length ? grand / invoices.length : 0,
    effectiveTaxRate: net > 0 ? (tax / net) * 100 : 0,
    perInvoice,
  };
}

export type RankedLineItem = { invoiceId: string; invoiceNumber: string; name: string; quantity: number; unitPrice: number; total: number; share: number };

/** Every line item in the batch, largest net value first, with its share of the batch net. */
export function rankLineItems(invoices: BatchInvoice[]): RankedLineItem[] {
  const rows = invoices.flatMap((inv) =>
    inv.items.map((item) => ({ invoiceId: inv.id, invoiceNumber: inv.number, name: item.name, quantity: safe(item.quantity), unitPrice: safe(item.unitPrice), total: lineTotal(item), share: 0 }))
  );
  const net = rows.reduce((s, r) => s + r.total, 0);
  return rows.map((r) => ({ ...r, share: net > 0 ? (r.total / net) * 100 : 0 })).sort((a, b) => b.total - a.total);
}

export type ClientRevenue = { client: string; invoiceCount: number; net: number; tax: number; total: number; share: number };

/** Revenue grouped by client (names compared trimmed and case-insensitively), largest total first. */
export function revenueByClient(invoices: BatchInvoice[], unnamed = "—"): ClientRevenue[] {
  const map = new Map<string, ClientRevenue>();
  for (const inv of invoices) {
    const label = inv.client.trim() || unnamed;
    const key = label.toLowerCase();
    const t = invoiceTotals(inv);
    const row = map.get(key) ?? { client: label, invoiceCount: 0, net: 0, tax: 0, total: 0, share: 0 };
    row.invoiceCount += 1;
    row.net += t.subtotal;
    row.tax += t.tax;
    row.total += t.total;
    map.set(key, row);
  }
  const rows = [...map.values()];
  const grand = rows.reduce((s, r) => s + r.total, 0);
  return rows.map((r) => ({ ...r, share: grand > 0 ? (r.total / grand) * 100 : 0 })).sort((a, b) => b.total - a.total);
}

export type ConcentrationZone = "low" | "medium" | "high";

/** Largest client's share of the batch total: under 25% low risk, 25–50% medium, over 50% high. */
export function concentrationZone(sharePercent: number): ConcentrationZone {
  return sharePercent > 50 ? "high" : sharePercent >= 25 ? "medium" : "low";
}

/** Herfindahl–Hirschman index of client shares (0–10,000); 10,000 means a single client. */
export const herfindahl = (rows: Pick<ClientRevenue, "share">[]) => rows.reduce((s, r) => s + r.share * r.share, 0);

export type DatedTotal = { id: string; number: string; date: string; client: string; total: number; dayOffset: number };

/** Invoices in date order with each one's total and its day offset from the first invoice. */
export function invoicesByDate(invoices: BatchInvoice[]): DatedTotal[] {
  const sorted = [...invoices].sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number));
  const first = sorted.length ? Date.parse(sorted[0].date) : 0;
  return sorted.map((inv) => {
    const d = Date.parse(inv.date);
    return {
      id: inv.id,
      number: inv.number,
      date: inv.date,
      client: inv.client,
      total: invoiceTotals(inv).total,
      dayOffset: Number.isFinite(d) && Number.isFinite(first) ? Math.round((d - first) / 86_400_000) : 0,
    };
  });
}

export type TaxSensitivity = { shift: number; grand: number; tax: number; delta: number };

/** Grand total with every invoice's rate moved by each shift in percentage points (never below 0%). */
export function taxRateSensitivity(invoices: BatchInvoice[], shifts: readonly number[] = [-5, 0, 5]): TaxSensitivity[] {
  const base = batchOverview(invoices).grand;
  return shifts.map((shift) => {
    const o = batchOverview(invoices, shift);
    return { shift, grand: o.grand, tax: o.tax, delta: o.grand - base };
  });
}

/** The batch grand total if every invoice used `ratePercent` instead of its own rate. */
export function grandAtRate(invoices: BatchInvoice[], ratePercent: number): number {
  const net = batchOverview(invoices).net;
  return net * (1 + Math.max(0, ratePercent) / 100);
}

/** Converts an amount between two currencies quoted as units per 1 USD. */
export const convertViaUsd = (amount: number, fromPerUsd: number, toPerUsd: number) => (fromPerUsd > 0 ? (amount / fromPerUsd) * toPerUsd : NaN);

/** RFC 4180 CSV: fields with commas, quotes or line breaks are quoted, quotes doubled; CRLF rows. */
export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
