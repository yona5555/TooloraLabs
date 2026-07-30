import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SalesTaxInput = {
  price: number;
  taxRate: number;
};

export type SalesTaxOutput = {
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
    description: "Calculate sales tax and total price.",
    version: "1.0.0",
  };

  execute(input: SalesTaxInput, _context: ToolContext): ToolResult<SalesTaxOutput> {
    const taxAmount = round(input.price * (input.taxRate / 100));
    const totalPrice = round(input.price + taxAmount);

    return {
      success: true,
      data: {
        price: round(input.price),
        taxRate: round(input.taxRate),
        taxAmount,
        totalPrice,
      },
      metadata: {},
    };
  }
}
