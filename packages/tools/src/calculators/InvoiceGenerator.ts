import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceGeneratorInput = {
  items: InvoiceLineItem[];
  taxRate: number;
  discountPercent?: number;
};

export type InvoiceLineTotal = InvoiceLineItem & { total: number };

export type InvoiceGeneratorOutput = {
  lines: InvoiceLineTotal[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

export class InvoiceGenerator extends BaseCalculator<
  InvoiceGeneratorInput,
  InvoiceGeneratorOutput
> {
  metadata = {
    id: "invoice-generator",
    slug: "invoice-generator",
    name: "Invoice Generator",
    category: "calculators",
    description: "Build an itemized invoice with subtotal, discount, and tax.",
    version: "1.0.0",
  };

  execute(
    input: InvoiceGeneratorInput,
    _context: ToolContext
  ): ToolResult<InvoiceGeneratorOutput> {
    const empty: InvoiceGeneratorOutput = {
      lines: [],
      subtotal: 0,
      discountAmount: 0,
      taxableAmount: 0,
      taxAmount: 0,
      total: 0,
    };

    if (!input.items || input.items.length === 0) {
      return { success: false, data: empty, metadata: { error: "EMPTY_ITEMS" } };
    }

    for (const item of input.items) {
      if (
        !item.description.trim() ||
        !(item.quantity > 0) ||
        !(item.unitPrice >= 0)
      ) {
        return { success: false, data: empty, metadata: { error: "INVALID_ITEM" } };
      }
    }

    if (!(input.taxRate >= 0)) {
      return { success: false, data: empty, metadata: { error: "INVALID_TAX_RATE" } };
    }

    const discountPercent = input.discountPercent ?? 0;
    if (discountPercent < 0 || discountPercent > 100) {
      return { success: false, data: empty, metadata: { error: "INVALID_DISCOUNT" } };
    }

    const lines: InvoiceLineTotal[] = input.items.map((item) => ({
      ...item,
      total: round(item.quantity * item.unitPrice),
    }));

    const subtotal = round(lines.reduce((sum, line) => sum + line.total, 0));
    const discountAmount = round((subtotal * discountPercent) / 100);
    const taxableAmount = round(subtotal - discountAmount);
    const taxAmount = round((taxableAmount * input.taxRate) / 100);
    const total = round(taxableAmount + taxAmount);

    return {
      success: true,
      data: { lines, subtotal, discountAmount, taxableAmount, taxAmount, total },
      metadata: {},
    };
  }
}
