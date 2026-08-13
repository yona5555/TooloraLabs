import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type BreakEvenInput = {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  /** Optional: a target monthly/period profit beyond simply breaking even. */
  targetProfit?: number;
};

export type BreakEvenOutput = {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMarginPerUnit: number;
  contributionMarginRatio: number;
  /** Units needed to reach targetProfit, if one was given — otherwise 0. */
  targetProfitUnits: number;
  targetProfitRevenue: number;
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

export class BreakEvenCalculator extends BaseCalculator<BreakEvenInput, BreakEvenOutput> {
  metadata = {
    id: "break-even-calculator",
    slug: "break-even-calculator",
    name: "Break-Even Point Calculator",
    category: "calculators",
    description: "Find how many units you need to sell to cover your fixed costs, or hit a target profit.",
    version: "1.1.0",
  };

  execute(input: BreakEvenInput, _context: ToolContext): ToolResult<BreakEvenOutput> {
    const empty: BreakEvenOutput = {
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      contributionMarginPerUnit: 0,
      contributionMarginRatio: 0,
      targetProfitUnits: 0,
      targetProfitRevenue: 0,
    };

    if (!(input.fixedCosts >= 0)) {
      return { success: false, data: empty, metadata: { error: "INVALID_FIXED_COSTS" } };
    }
    if (!(input.variableCostPerUnit >= 0) || !(input.pricePerUnit >= 0)) {
      return { success: false, data: empty, metadata: { error: "INVALID_COST" } };
    }
    if (input.pricePerUnit <= input.variableCostPerUnit) {
      return { success: false, data: empty, metadata: { error: "NO_BREAK_EVEN" } };
    }

    const contributionMarginPerUnit = input.pricePerUnit - input.variableCostPerUnit;
    const breakEvenUnits = Math.ceil(input.fixedCosts / contributionMarginPerUnit);
    const breakEvenRevenue = round(breakEvenUnits * input.pricePerUnit);
    const contributionMarginRatio = round(
      (contributionMarginPerUnit / input.pricePerUnit) * 100
    );

    const targetProfit = input.targetProfit ?? 0;
    const targetProfitUnits =
      targetProfit > 0 ? Math.ceil((input.fixedCosts + targetProfit) / contributionMarginPerUnit) : 0;
    const targetProfitRevenue = targetProfitUnits > 0 ? round(targetProfitUnits * input.pricePerUnit) : 0;

    return {
      success: true,
      data: {
        breakEvenUnits,
        breakEvenRevenue,
        contributionMarginPerUnit: round(contributionMarginPerUnit),
        contributionMarginRatio,
        targetProfitUnits,
        targetProfitRevenue,
      },
      metadata: {},
    };
  }
}
