import { describe, expect, it } from "vitest";
import { BatchInvoiceCalculator, summarizeInvoices } from "../BatchInvoiceCalculator";

const ctx = { locale: "en-US" };

describe("BatchInvoiceCalculator", () => {
  const tool = new BatchInvoiceCalculator();

  it("computes a single invoice with one line item and tax", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Widget", quantity: 2, unitPrice: 50 }], taxPercent: 10 },
      ctx,
    );
    expect(result.data.error).toBeNull();
    expect(result.data.lineTotals).toEqual([100]);
    expect(result.data.subtotal).toBe(100);
    expect(result.data.taxAmount).toBeCloseTo(10, 5);
    expect(result.data.total).toBeCloseTo(110, 5);
  });

  it("computes a multi-line invoice correctly", () => {
    const result = tool.execute(
      {
        lineItems: [
          { itemName: "Widget", quantity: 2, unitPrice: 50 },
          { itemName: "Gadget", quantity: 1, unitPrice: 25 },
        ],
        taxPercent: 8,
      },
      ctx,
    );
    expect(result.data.lineTotals).toEqual([100, 25]);
    expect(result.data.subtotal).toBe(125);
    expect(result.data.taxAmount).toBeCloseTo(10, 5);
    expect(result.data.total).toBeCloseTo(135, 5);
  });

  it("supports zero tax", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Widget", quantity: 1, unitPrice: 100 }], taxPercent: 0 },
      ctx,
    );
    expect(result.data.taxAmount).toBe(0);
    expect(result.data.total).toBe(100);
  });

  it("rejects an empty line item list", () => {
    const result = tool.execute({ lineItems: [], taxPercent: 10 }, ctx);
    expect(result.data.error).toBe("no-line-items");
  });

  it("rejects a line item with zero quantity", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Widget", quantity: 0, unitPrice: 50 }], taxPercent: 10 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-line-item");
  });

  it("rejects a line item with negative unit price", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Widget", quantity: 1, unitPrice: -5 }], taxPercent: 10 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-line-item");
  });

  it("rejects a negative tax percent", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Widget", quantity: 1, unitPrice: 50 }], taxPercent: -5 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-tax");
  });

  it("allows a zero unit price (e.g. free item)", () => {
    const result = tool.execute(
      { lineItems: [{ itemName: "Free Sample", quantity: 1, unitPrice: 0 }], taxPercent: 10 },
      ctx,
    );
    expect(result.data.error).toBeNull();
    expect(result.data.total).toBe(0);
  });
});

describe("summarizeInvoices", () => {
  it("returns zeros for an empty list", () => {
    const summary = summarizeInvoices([]);
    expect(summary).toEqual({ invoiceCount: 0, netBeforeTax: 0, taxTotal: 0, grandTotal: 0 });
  });

  it("aggregates multiple invoices", () => {
    const summary = summarizeInvoices([
      { subtotal: 100, taxAmount: 10, total: 110 },
      { subtotal: 200, taxAmount: 16, total: 216 },
    ]);
    expect(summary.invoiceCount).toBe(2);
    expect(summary.netBeforeTax).toBe(300);
    expect(summary.taxTotal).toBe(26);
    expect(summary.grandTotal).toBe(326);
  });
});
