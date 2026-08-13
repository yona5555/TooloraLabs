import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type InventoryBatch = {
  /** Units purchased in this lot. Batches are ordered oldest first. */
  quantity: number;
  unitCost: number;
};

export type InventoryLineItem = {
  name: string;
  /** Purchase lots, oldest first — the layers FIFO/LIFO draw down from. */
  batches: InventoryBatch[];
  /** Units sold this period, drawn down against the batches above. */
  unitsSold?: number;
  reorderThreshold?: number;
};

export type InventoryValuationInput = {
  items: InventoryLineItem[];
};

export type CostingBreakdown = {
  cogs: number;
  endingValue: number;
  averageUnitCost: number;
};

export type InventoryLineItemValue = {
  name: string;
  totalUnitsPurchased: number;
  totalCostPurchased: number;
  unitsSold: number;
  endingUnits: number;
  reorderThreshold?: number;
  belowThreshold: boolean;
  fifo: CostingBreakdown;
  lifo: CostingBreakdown;
  weightedAverage: CostingBreakdown;
};

export type InventoryValuationOutput = {
  items: InventoryLineItemValue[];
  totalEndingUnits: number;
  totalValueFifo: number;
  totalValueLifo: number;
  totalValueWeightedAverage: number;
  lowStockCount: number;
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

function drawDown(batches: InventoryBatch[], unitsSold: number): { cogs: number; endingValue: number } {
  let remaining = unitsSold;
  let cogs = 0;
  let endingValue = 0;

  for (const batch of batches) {
    if (remaining <= 0) {
      endingValue += batch.quantity * batch.unitCost;
      continue;
    }
    const consumed = Math.min(batch.quantity, remaining);
    cogs += consumed * batch.unitCost;
    endingValue += (batch.quantity - consumed) * batch.unitCost;
    remaining -= consumed;
  }

  return { cogs, endingValue };
}

export class InventoryValuationCalculator extends BaseCalculator<
  InventoryValuationInput,
  InventoryValuationOutput
> {
  metadata = {
    id: "inventory-valuation-calculator",
    slug: "inventory-valuation-calculator",
    name: "Inventory Valuation Calculator",
    category: "calculators",
    description:
      "Value your stock under FIFO, LIFO, and weighted-average costing, and flag items below their reorder threshold.",
    version: "2.0.0",
  };

  execute(
    input: InventoryValuationInput,
    _context: ToolContext
  ): ToolResult<InventoryValuationOutput> {
    const empty: InventoryValuationOutput = {
      items: [],
      totalEndingUnits: 0,
      totalValueFifo: 0,
      totalValueLifo: 0,
      totalValueWeightedAverage: 0,
      lowStockCount: 0,
    };

    if (!input.items || input.items.length === 0) {
      return { success: false, data: empty, metadata: { error: "EMPTY_ITEMS" } };
    }

    for (const item of input.items) {
      if (!item.name.trim() || !item.batches || item.batches.length === 0) {
        return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
      }
      for (const batch of item.batches) {
        if (!(batch.quantity >= 0) || !(batch.unitCost >= 0)) {
          return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
        }
      }
      if (item.unitsSold !== undefined && !(item.unitsSold >= 0)) {
        return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
      }
      if (item.reorderThreshold !== undefined && !(item.reorderThreshold >= 0)) {
        return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
      }
    }

    const items: InventoryLineItemValue[] = input.items.map((item) => {
      const totalUnitsPurchased = item.batches.reduce((sum, b) => sum + b.quantity, 0);
      const totalCostPurchased = round(
        item.batches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0)
      );
      const unitsSold = Math.min(item.unitsSold ?? 0, totalUnitsPurchased);
      const endingUnits = totalUnitsPurchased - unitsSold;

      const fifoRaw = drawDown(item.batches, unitsSold);
      const lifoRaw = drawDown([...item.batches].reverse(), unitsSold);

      const avgUnitCost = totalUnitsPurchased > 0 ? totalCostPurchased / totalUnitsPurchased : 0;
      const wacCogs = unitsSold * avgUnitCost;
      const wacEndingValue = endingUnits * avgUnitCost;

      const fifo: CostingBreakdown = {
        cogs: round(fifoRaw.cogs),
        endingValue: round(fifoRaw.endingValue),
        averageUnitCost: endingUnits > 0 ? round(fifoRaw.endingValue / endingUnits) : 0,
      };
      const lifo: CostingBreakdown = {
        cogs: round(lifoRaw.cogs),
        endingValue: round(lifoRaw.endingValue),
        averageUnitCost: endingUnits > 0 ? round(lifoRaw.endingValue / endingUnits) : 0,
      };
      const weightedAverage: CostingBreakdown = {
        cogs: round(wacCogs),
        endingValue: round(wacEndingValue),
        averageUnitCost: round(avgUnitCost),
      };

      return {
        name: item.name,
        totalUnitsPurchased,
        totalCostPurchased,
        unitsSold,
        endingUnits,
        reorderThreshold: item.reorderThreshold,
        belowThreshold: item.reorderThreshold !== undefined && endingUnits <= item.reorderThreshold,
        fifo,
        lifo,
        weightedAverage,
      };
    });

    const totalEndingUnits = items.reduce((sum, i) => sum + i.endingUnits, 0);
    const totalValueFifo = round(items.reduce((sum, i) => sum + i.fifo.endingValue, 0));
    const totalValueLifo = round(items.reduce((sum, i) => sum + i.lifo.endingValue, 0));
    const totalValueWeightedAverage = round(
      items.reduce((sum, i) => sum + i.weightedAverage.endingValue, 0)
    );
    const lowStockCount = items.filter((i) => i.belowThreshold).length;

    return {
      success: true,
      data: {
        items,
        totalEndingUnits,
        totalValueFifo,
        totalValueLifo,
        totalValueWeightedAverage,
        lowStockCount,
      },
      metadata: {},
    };
  }
}
