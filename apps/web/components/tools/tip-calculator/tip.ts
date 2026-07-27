import type { TipResult } from "./types";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTip(
  billAmount: number,
  tipPercent: number,
  people: number
): TipResult {
  const safePeople = Math.max(1, people);

  const tipAmount = round(billAmount * (tipPercent / 100));
  const totalAmount = round(billAmount + tipAmount);

  return {
    billAmount: round(billAmount),
    tipPercent: round(tipPercent),
    people: safePeople,
    tipAmount,
    totalAmount,
    tipPerPerson: round(tipAmount / safePeople),
    totalPerPerson: round(totalAmount / safePeople),
  };
}
