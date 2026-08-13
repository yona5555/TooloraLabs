import { describe, it, expect } from "vitest";
import { InventoryValuationCalculator } from "../InventoryValuationCalculator";

const context = { locale: "en-US" };
const tool = new InventoryValuationCalculator();

describe("InventoryValuationCalculator", () => {
  it("values a single-batch item the same across all three costing methods when nothing is sold", () => {
    const r = tool.execute(
      {
        items: [{ name: "Widget", batches: [{ quantity: 10, unitCost: 5 }] }],
      },
      context
    );
    expect(r.success).toBe(true);
    expect(r.data.items[0].endingUnits).toBe(10);
    expect(r.data.items[0].fifo.endingValue).toBe(50);
    expect(r.data.items[0].lifo.endingValue).toBe(50);
    expect(r.data.items[0].weightedAverage.endingValue).toBe(50);
    expect(r.data.totalValueFifo).toBe(50);
  });

  it("computes FIFO: oldest (cheapest) layer is consumed first, so ending value uses the newer, pricier layer", () => {
    const r = tool.execute(
      {
        items: [
          {
            name: "Widget",
            batches: [
              { quantity: 10, unitCost: 5 },
              { quantity: 10, unitCost: 8 },
            ],
            unitsSold: 12,
          },
        ],
      },
      context
    );
    const item = r.data.items[0];
    expect(item.endingUnits).toBe(8);
    // FIFO: sell 10 @5 + 2 @8 = 66 COGS; ending 8 units @8 = 64
    expect(item.fifo.cogs).toBe(66);
    expect(item.fifo.endingValue).toBe(64);
  });

  it("computes LIFO: newest (pricier) layer is consumed first, so ending value uses the older, cheaper layer", () => {
    const r = tool.execute(
      {
        items: [
          {
            name: "Widget",
            batches: [
              { quantity: 10, unitCost: 5 },
              { quantity: 10, unitCost: 8 },
            ],
            unitsSold: 12,
          },
        ],
      },
      context
    );
    const item = r.data.items[0];
    // LIFO: sell 10 @8 + 2 @5 = 90 COGS; ending 8 units @5 = 40
    expect(item.lifo.cogs).toBe(90);
    expect(item.lifo.endingValue).toBe(40);
  });

  it("computes weighted-average costing using a single blended unit cost", () => {
    const r = tool.execute(
      {
        items: [
          {
            name: "Widget",
            batches: [
              { quantity: 10, unitCost: 5 },
              { quantity: 10, unitCost: 8 },
            ],
            unitsSold: 12,
          },
        ],
      },
      context
    );
    const item = r.data.items[0];
    // avg cost = (50+80)/20 = 6.5; COGS = 12*6.5 = 78; ending = 8*6.5 = 52
    expect(item.weightedAverage.averageUnitCost).toBe(6.5);
    expect(item.weightedAverage.cogs).toBe(78);
    expect(item.weightedAverage.endingValue).toBe(52);
  });

  it("caps unitsSold at the total units purchased", () => {
    const r = tool.execute(
      {
        items: [{ name: "Widget", batches: [{ quantity: 5, unitCost: 5 }], unitsSold: 100 }],
      },
      context
    );
    expect(r.data.items[0].unitsSold).toBe(5);
    expect(r.data.items[0].endingUnits).toBe(0);
  });

  it("flags items at or below their reorder threshold based on ending units", () => {
    const r = tool.execute(
      {
        items: [
          {
            name: "Widget",
            batches: [{ quantity: 10, unitCost: 5 }],
            unitsSold: 8,
            reorderThreshold: 5,
          },
          { name: "Gadget", batches: [{ quantity: 10, unitCost: 20 }], reorderThreshold: 5 },
        ],
      },
      context
    );
    expect(r.data.items[0].belowThreshold).toBe(true);
    expect(r.data.items[1].belowThreshold).toBe(false);
    expect(r.data.lowStockCount).toBe(1);
  });

  it("allows a zero-quantity batch", () => {
    const r = tool.execute(
      { items: [{ name: "Out of stock", batches: [{ quantity: 0, unitCost: 5 }] }] },
      context
    );
    expect(r.success).toBe(true);
    expect(r.data.items[0].endingUnits).toBe(0);
  });

  it("returns a failure for an empty items list", () => {
    const r = tool.execute({ items: [] }, context);
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("EMPTY_ITEMS");
  });

  it("returns a failure for an item with no batches", () => {
    const r = tool.execute({ items: [{ name: "X", batches: [] }] }, context);
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_ITEM");
  });

  it("returns a failure for a negative batch quantity", () => {
    const r = tool.execute(
      { items: [{ name: "X", batches: [{ quantity: -1, unitCost: 5 }] }] },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_ITEM");
  });
});
