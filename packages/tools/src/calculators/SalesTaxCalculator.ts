import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SalesTaxMode = "add" | "reverse";

export type SalesTaxInput = {
  mode: SalesTaxMode;
  /** Pre-tax price, used in "add" mode. */
  price: number;
  /** Known tax-inclusive total (e.g. a receipt total), used in "reverse" mode. */
  totalPrice: number;
  taxRate: number;
};

export type SalesTaxOutput = {
  mode: SalesTaxMode;
  price: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export class SalesTaxCalculator extends BaseCalculator<SalesTaxInput, SalesTaxOutput> {
  metadata = {
    id: "sales-tax-calculator",
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    category: "calculators",
    description: "Calculate sales tax and total price, or back out the pre-tax price from a tax-inclusive total.",
    version: "1.0.0",
  };

  execute(input: SalesTaxInput, _context: ToolContext): ToolResult<SalesTaxOutput> {
    const rate = Math.max(input.taxRate, 0);

    if (input.mode === "reverse") {
      const price = input.totalPrice / (1 + rate / 100);
      const taxAmount = input.totalPrice - price;

      return {
        success: true,
        data: {
          mode: "reverse",
          price: round(price),
          taxRate: round(rate),
          taxAmount: round(taxAmount),
          totalPrice: round(input.totalPrice),
        },
        metadata: {},
      };
    }

    const taxAmount = round(input.price * (rate / 100));
    const totalPrice = round(input.price + taxAmount);

    return {
      success: true,
      data: {
        mode: "add",
        price: round(input.price),
        taxRate: round(rate),
        taxAmount,
        totalPrice,
      },
      metadata: {},
    };
  }
}
