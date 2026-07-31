import { describe, it, expect } from "vitest";
import { InventoryValuationCalculator } from "../InventoryValuationCalculator";

const context = { locale: "en-US" };
const tool = new InventoryValuationCalculator();

describe("InventoryValuationCalculator", () => {
  it("computes per-item value and total inventory value", () => {
    const r = tool.execute(
      {
        items: [
          { name: "Widget", quantity: 10, unitCost: 5 },
          { name: "Gadget", quantity: 3, unitCost: 20 },
        ],
      },
      context
    );
    expect(r.success).toBe(true);
    expect(r.data.items[0].value).toBe(50);
    expect(r.data.items[1].value).toBe(60);
    expect(r.data.totalUnits).toBe(13);
    expect(r.data.totalValue).toBe(110);
    expect(r.data.lowStockCount).toBe(0);
  });

  it("flags items at or below their reorder threshold", () => {
    const r = tool.execute(
      {
        items: [
          { name: "Widget", quantity: 2, unitCost: 5, reorderThreshold: 5 },
          { name: "Gadget", quantity: 10, unitCost: 20, reorderThreshold: 5 },
        ],
      },
      context
    );
    expect(r.data.items[0].belowThreshold).toBe(true);
    expect(r.data.items[1].belowThreshold).toBe(false);
    expect(r.data.lowStockCount).toBe(1);
  });

  it("allows zero quantity items", () => {
    const r = tool.execute({ items: [{ name: "Out of stock", quantity: 0, unitCost: 5 }] }, context);
    expect(r.success).toBe(true);
    expect(r.data.items[0].value).toBe(0);
  });

  it("returns a failure for an empty items list", () => {
    const r = tool.execute({ items: [] }, context);
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("EMPTY_ITEMS");
  });

  it("returns a failure for a negative quantity", () => {
    const r = tool.execute({ items: [{ name: "X", quantity: -1, unitCost: 5 }] }, context);
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_ITEM");
  });
});
