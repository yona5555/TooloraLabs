import { describe, it, expect } from "vitest";
import {
  batchOverview,
  concentrationZone,
  convertViaUsd,
  grandAtRate,
  herfindahl,
  invoiceTotals,
  invoicesByDate,
  rankLineItems,
  revenueByClient,
  taxRateSensitivity,
  toCsv,
  type BatchInvoice,
} from "../BatchInvoiceMath";

const batch: BatchInvoice[] = [
  { id: "a", number: "INV-1", date: "2026-03-10", client: "Acme", taxPercent: 10, items: [{ name: "Design", quantity: 10, unitPrice: 50 }, { name: "Hosting", quantity: 1, unitPrice: 100 }] },
  { id: "b", number: "INV-2", date: "2026-03-01", client: "Globex", taxPercent: 20, items: [{ name: "Audit", quantity: 2, unitPrice: 200 }] },
  { id: "c", number: "INV-3", date: "2026-03-15", client: " acme ", taxPercent: 0, items: [{ name: "Fix", quantity: 3, unitPrice: 100 }] },
];

describe("BatchInvoiceMath", () => {
  it("totals one invoice and treats blank or negative fields as zero", () => {
    expect(invoiceTotals(batch[0])).toEqual({ lineTotals: [500, 100], subtotal: 600, tax: 60, total: 660 });
    expect(invoiceTotals({ taxPercent: -5, items: [{ name: "x", quantity: NaN, unitPrice: 9 }, { name: "y", quantity: 2, unitPrice: 3 }] }).total).toBe(6);
  });

  it("summarizes the batch with a blended tax rate", () => {
    const o = batchOverview(batch);
    expect(o.net).toBe(1300);
    expect(o.tax).toBe(140);
    expect(o.grand).toBe(1440);
    expect(o.itemCount).toBe(4);
    expect(o.averageInvoice).toBe(480);
    expect(o.effectiveTaxRate).toBeCloseTo(10.769, 3);
    expect(batchOverview([]).effectiveTaxRate).toBe(0);
  });

  it("ranks line items by value with shares of net", () => {
    const r = rankLineItems(batch);
    expect(r.map((x) => x.name)).toEqual(["Design", "Audit", "Fix", "Hosting"]);
    expect(r[0].share).toBeCloseTo(38.46, 2);
  });

  it("groups clients case-insensitively and scores concentration", () => {
    const c = revenueByClient(batch);
    expect(c).toHaveLength(2);
    expect(c[0]).toMatchObject({ client: "Acme", invoiceCount: 2, net: 900, total: 960 });
    expect(c[0].share).toBeCloseTo(66.67, 2);
    expect(concentrationZone(c[0].share)).toBe("high");
    expect(concentrationZone(30)).toBe("medium");
    expect(concentrationZone(20)).toBe("low");
    expect(herfindahl([{ share: 100 }])).toBe(10000);
  });

  it("orders invoices by date with day offsets", () => {
    const d = invoicesByDate(batch);
    expect(d.map((x) => x.number)).toEqual(["INV-2", "INV-1", "INV-3"]);
    expect(d.map((x) => x.dayOffset)).toEqual([0, 9, 14]);
  });

  it("shifts every rate for the sensitivity trio and never goes below 0%", () => {
    const [low, now, high] = taxRateSensitivity(batch);
    expect(now.grand).toBe(1440);
    // -5 pp: 600×5% + 400×15% + 300×0% = 90
    expect(low.tax).toBeCloseTo(90, 9);
    expect(high.tax).toBeCloseTo(205, 9);
    expect(high.delta).toBeCloseTo(65, 9);
    expect(grandAtRate(batch, 15)).toBeCloseTo(1495, 9);
  });

  it("converts through USD and writes RFC 4180 CSV", () => {
    expect(convertViaUsd(375, 3.75, 0.9)).toBeCloseTo(90, 9);
    expect(Number.isNaN(convertViaUsd(1, 0, 1))).toBe(true);
    expect(toCsv([["a", 'say "hi"', "x,y"], [1, 2.5, "line\nbreak"]])).toBe('a,"say ""hi""","x,y"\r\n1,2.5,"line\nbreak"');
  });
});
