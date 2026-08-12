import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DiscountMode = "apply" | "reverse";

export type DiscountInput = {
  mode: DiscountMode;
  /** Starting price, used in "apply" mode. */
  originalPrice: number;
  /** Known sale price, used in "reverse" mode. */
  finalPrice: number;
  /**
   * One or more discount percentages applied in sequence (e.g. 30 then 10 —
   * "apply" mode supports stacking several; "reverse" mode only uses the first.
   */
  discounts: number[];
};

export type DiscountOutput = {
  mode: DiscountMode;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  saved: number;
  /** The overall percentage off from original to final — distinct from the sum of stacked rates. */
  effectiveDiscountPercent: number;
  discounts: number[];
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

function clampPercent(value: number, max = 100): number {
  return Math.min(Math.max(value, 0), max);
}

export class DiscountCalculator extends BaseCalculator<DiscountInput, DiscountOutput> {
  metadata = {
    id: "discount-calculator",
    slug: "discount-calculator",
    name: "Discount Calculator",
    category: "calculators",
    description: "Calculate discounted price, stacked discounts, and savings — or reverse-engineer the original price.",
    version: "1.0.0",
  };

  execute(input: DiscountInput, _context: ToolContext): ToolResult<DiscountOutput> {
    const discounts = (input.discounts ?? []).filter((d) => Number.isFinite(d));

    if (input.mode === "reverse") {
      const rate = clampPercent(discounts[0] ?? 0, 99.99);
      const originalPrice = input.finalPrice / (1 - rate / 100);
      const saved = originalPrice - input.finalPrice;

      return {
        success: true,
        data: {
          mode: "reverse",
          originalPrice: round(originalPrice),
          finalPrice: round(input.finalPrice),
          discountAmount: round(saved),
          saved: round(saved),
          effectiveDiscountPercent: round(rate),
          discounts: [round(rate)],
        },
        metadata: {},
      };
    }

    let price = input.originalPrice;
    const appliedDiscounts: number[] = [];
    for (const d of discounts) {
      const rate = clampPercent(d);
      price = price * (1 - rate / 100);
      appliedDiscounts.push(round(rate));
    }

    const finalPrice = round(price);
    const saved = round(input.originalPrice - finalPrice);
    const effectiveDiscountPercent = input.originalPrice > 0 ? round((saved / input.originalPrice) * 100) : 0;

    return {
      success: true,
      data: {
        mode: "apply",
        originalPrice: round(input.originalPrice),
        finalPrice,
        discountAmount: saved,
        saved,
        effectiveDiscountPercent,
        discounts: appliedDiscounts,
      },
      metadata: {},
    };
  }
}
