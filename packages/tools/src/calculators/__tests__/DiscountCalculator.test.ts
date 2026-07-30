import { describe, it, expect } from "vitest";
import { DiscountCalculator } from "../DiscountCalculator";

const context = { locale: "en-US" };
const calc = new DiscountCalculator();

describe("DiscountCalculator", () => {
  it("computes discount amount and final price", () => {
    const r = calc.execute({ originalPrice: 200, discountPercent: 25 }, context);
    expect(r.data.discountAmount).toBe(50);
    expect(r.data.finalPrice).toBe(150);
    expect(r.data.saved).toBe(50);
  });

  it("handles zero discount", () => {
    const r = calc.execute({ originalPrice: 100, discountPercent: 0 }, context);
    expect(r.data.finalPrice).toBe(100);
  });
});
