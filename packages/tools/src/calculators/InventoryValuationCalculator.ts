import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type InventoryItem = {
  name: string;
  quantity: number;
  unitCost: number;
  reorderThreshold?: number;
};

export type InventoryValuationInput = {
  items: InventoryItem[];
};

export type InventoryItemValue = InventoryItem & {
  value: number;
  belowThreshold: boolean;
};

export type InventoryValuationOutput = {
  items: InventoryItemValue[];
  totalUnits: number;
  totalValue: number;
  lowStockCount: number;
};

function round(value: number): number {
  return Number(value.toFixed(2));
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
    description: "Value your stock and flag items below their reorder threshold.",
    version: "1.0.0",
  };

  execute(
    input: InventoryValuationInput,
    _context: ToolContext
  ): ToolResult<InventoryValuationOutput> {
    const empty: InventoryValuationOutput = {
      items: [],
      totalUnits: 0,
      totalValue: 0,
      lowStockCount: 0,
    };

    if (!input.items || input.items.length === 0) {
      return { success: false, data: empty, metadata: { error: "EMPTY_ITEMS" } };
    }

    for (const item of input.items) {
      if (!item.name.trim() || !(item.quantity >= 0) || !(item.unitCost >= 0)) {
        return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
      }
    }

    const items: InventoryItemValue[] = input.items.map((item) => ({
      ...item,
      value: round(item.quantity * item.unitCost),
      belowThreshold:
        item.reorderThreshold !== undefined && item.quantity <= item.reorderThreshold,
    }));

    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = round(items.reduce((sum, item) => sum + item.value, 0));
    const lowStockCount = items.filter((item) => item.belowThreshold).length;

    return {
      success: true,
      data: { items, totalUnits, totalValue, lowStockCount },
      metadata: {},
    };
  }
}
