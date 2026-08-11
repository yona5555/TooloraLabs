import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TipInput = {
  billAmount: number;
  tipPercent: number;
  people: number;
  /** Rounds each person's total up to the next whole currency unit, absorbing the extra into the tip — avoids owing change. */
  roundUpPerPerson?: boolean;
};

export type TipOutput = {
  billAmount: number;
  tipPercent: number;
  people: number;
  tipAmount: number;
  totalAmount: number;
  tipPerPerson: number;
  totalPerPerson: number;
  roundedUp: boolean;
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
    const rawTipAmount = input.billAmount * (input.tipPercent / 100);
    const rawTotalAmount = input.billAmount + rawTipAmount;
    const rawTotalPerPerson = rawTotalAmount / safePeople;

    const roundedUp = Boolean(input.roundUpPerPerson);
    const totalPerPerson = roundedUp ? Math.ceil(rawTotalPerPerson) : round(rawTotalPerPerson);
    const totalAmount = roundedUp ? round(totalPerPerson * safePeople) : round(rawTotalAmount);
    const tipAmount = roundedUp ? round(totalAmount - input.billAmount) : round(rawTipAmount);

    return {
      success: true,
      data: {
        billAmount: round(input.billAmount),
        tipPercent: round(input.tipPercent),
        people: safePeople,
        tipAmount,
        totalAmount,
        tipPerPerson: round(tipAmount / safePeople),
        totalPerPerson,
        roundedUp,
      },
      metadata: {},
    };
  }
}
