import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DiscountInput = {
  originalPrice: number;
  discountPercent: number;
};

export type DiscountOutput = {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  saved: number;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

export class DiscountCalculator extends BaseCalculator<DiscountInput, DiscountOutput> {
  metadata = {
    id: "discount-calculator",
    slug: "discount-calculator",
    name: "Discount Calculator",
    category: "calculators",
    description: "Calculate discounted price and savings.",
    version: "1.0.0",
  };

  execute(input: DiscountInput, _context: ToolContext): ToolResult<DiscountOutput> {
    const discountAmount = (input.originalPrice * input.discountPercent) / 100;
    const finalPrice = input.originalPrice - discountAmount;

    return {
      success: true,
      data: {
        originalPrice: round(input.originalPrice),
        discountPercent: round(input.discountPercent),
        discountAmount: round(discountAmount),
        finalPrice: round(finalPrice),
        saved: round(discountAmount),
      },
      metadata: {},
    };
  }
}
