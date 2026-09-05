import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type InvoiceLineItemInput = {
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type BatchInvoiceCalculatorInput = {
  lineItems: InvoiceLineItemInput[];
  taxPercent: number;
};

export type BatchInvoiceCalculatorError = "no-line-items" | "invalid-line-item" | "invalid-tax";

export type BatchInvoiceCalculatorOutput = {
  error: BatchInvoiceCalculatorError | null;
  lineTotals: number[];
  subtotal: number;
  taxAmount: number;
  total: number;
};

export type SavedInvoiceSummaryInput = {
  subtotal: number;
  taxAmount: number;
  total: number;
};

export type BatchSummary = {
  invoiceCount: number;
  netBeforeTax: number;
  taxTotal: number;
  grandTotal: number;
};

/** Aggregates already-computed saved invoices into a live running summary. Pure, framework-agnostic. */
export function summarizeInvoices(invoices: SavedInvoiceSummaryInput[]): BatchSummary {
  return invoices.reduce<BatchSummary>(
    (acc, invoice) => ({
      invoiceCount: acc.invoiceCount + 1,
      netBeforeTax: acc.netBeforeTax + invoice.subtotal,
      taxTotal: acc.taxTotal + invoice.taxAmount,
      grandTotal: acc.grandTotal + invoice.total,
    }),
    { invoiceCount: 0, netBeforeTax: 0, taxTotal: 0, grandTotal: 0 },
  );
}

export class BatchInvoiceCalculator extends BaseCalculator<BatchInvoiceCalculatorInput, BatchInvoiceCalculatorOutput> {
  metadata = {
    id: "batch-invoice-calculator",
    slug: "batch-invoice-calculator",
    name: "Batch Invoice Calculator",
    category: "business-finance",
    description: "Build multiple invoices with line items and tax, and track a running total across all of them.",
    version: "1.0.0",
  };

  execute(input: BatchInvoiceCalculatorInput, _context: ToolContext): ToolResult<BatchInvoiceCalculatorOutput> {
    const { lineItems, taxPercent } = input;

    if (!lineItems || lineItems.length === 0) {
      return this.error("no-line-items");
    }

    for (const item of lineItems) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return this.error("invalid-line-item");
      }
      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        return this.error("invalid-line-item");
      }
    }

    if (!Number.isFinite(taxPercent) || taxPercent < 0) {
      return this.error("invalid-tax");
    }

    const lineTotals = lineItems.map((item) => item.quantity * item.unitPrice);
    const subtotal = lineTotals.reduce((sum, t) => sum + t, 0);
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;

    return {
      success: true,
      data: { error: null, lineTotals, subtotal, taxAmount, total },
      metadata: {},
    };
  }

  private error(error: BatchInvoiceCalculatorError): ToolResult<BatchInvoiceCalculatorOutput> {
    return {
      success: true,
      data: { error, lineTotals: [], subtotal: 0, taxAmount: 0, total: 0 },
      metadata: {},
    };
  }
}
