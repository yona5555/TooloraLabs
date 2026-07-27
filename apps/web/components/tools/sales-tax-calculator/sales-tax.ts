import type { SalesTaxResult } from "./types";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSalesTax(
  price: number,
  taxRate: number
): SalesTaxResult {
  const taxAmount = round(price * (taxRate / 100));
  const totalPrice = round(price + taxAmount);

  return {
    price: round(price),
    taxRate: round(taxRate),
    taxAmount,
    totalPrice,
  };
}
