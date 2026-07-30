import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TipInput = {
  billAmount: number;
  tipPercent: number;
  people: number;
};

export type TipOutput = {
  billAmount: number;
  tipPercent: number;
  people: number;
  tipAmount: number;
  totalAmount: number;
  tipPerPerson: number;
  totalPerPerson: number;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export class TipCalculator extends BaseCalculator<TipInput, TipOutput> {
  metadata = {
    id: "tip-calculator",
    slug: "tip-calculator",
    name: "Tip Calculator",
    category: "calculators",
    description: "Calculate tip amount and split the bill.",
    version: "1.0.0",
  };

  execute(input: TipInput, _context: ToolContext): ToolResult<TipOutput> {
    const safePeople = Math.max(1, input.people);
    const tipAmount = round(input.billAmount * (input.tipPercent / 100));
    const totalAmount = round(input.billAmount + tipAmount);

    return {
      success: true,
      data: {
        billAmount: round(input.billAmount),
        tipPercent: round(input.tipPercent),
        people: safePeople,
        tipAmount,
        totalAmount,
        tipPerPerson: round(tipAmount / safePeople),
        totalPerPerson: round(totalAmount / safePeople),
      },
      metadata: {},
    };
  }
}
