import type { DiscountResult } from "./types";

function round(value: number) {
  return Number(value.toFixed(2));
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number
): DiscountResult {
  const discountAmount =
    (originalPrice * discountPercent) / 100;

  const finalPrice =
    originalPrice - discountAmount;

  return {
    originalPrice: round(originalPrice),
    discountPercent: round(discountPercent),
    discountAmount: round(discountAmount),
    finalPrice: round(finalPrice),
    saved: round(discountAmount),
  };
}
