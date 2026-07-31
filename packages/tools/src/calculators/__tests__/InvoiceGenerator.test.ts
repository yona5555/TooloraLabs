import { describe, it, expect } from "vitest";
import { InvoiceGenerator } from "../InvoiceGenerator";

const context = { locale: "en-US" };
const tool = new InvoiceGenerator();

describe("InvoiceGenerator", () => {
  it("computes line totals, subtotal, tax, and grand total", () => {
    const r = tool.execute(
      {
        items: [
          { description: "Design work", quantity: 10, unitPrice: 50 },
          { description: "Hosting", quantity: 1, unitPrice: 20 },
        ],
        taxRate: 15,
      },
      context
    );
    expect(r.success).toBe(true);
    expect(r.data.lines[0].total).toBe(500);
    expect(r.data.lines[1].total).toBe(20);
    expect(r.data.subtotal).toBe(520);
    expect(r.data.discountAmount).toBe(0);
    expect(r.data.taxAmount).toBe(78);
    expect(r.data.total).toBe(598);
  });

  it("applies a discount before computing tax", () => {
    const r = tool.execute(
      {
        items: [{ description: "Consulting", quantity: 1, unitPrice: 1000 }],
        taxRate: 10,
        discountPercent: 20,
      },
      context
    );
    expect(r.data.discountAmount).toBe(200);
    expect(r.data.taxableAmount).toBe(800);
    expect(r.data.taxAmount).toBe(80);
    expect(r.data.total).toBe(880);
  });

  it("returns a failure for an empty items list", () => {
    const r = tool.execute({ items: [], taxRate: 10 }, context);
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("EMPTY_ITEMS");
  });

  it("returns a failure for an item with zero quantity", () => {
    const r = tool.execute(
      { items: [{ description: "X", quantity: 0, unitPrice: 10 }], taxRate: 10 },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_ITEM");
  });

  it("returns a failure for an out-of-range discount", () => {
    const r = tool.execute(
      {
        items: [{ description: "X", quantity: 1, unitPrice: 10 }],
        taxRate: 10,
        discountPercent: 150,
      },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_DISCOUNT");
  });
});
