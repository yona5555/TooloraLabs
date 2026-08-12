import { describe, it, expect } from "vitest";
import { DiscountCalculator } from "../DiscountCalculator";

const context = { locale: "en-US" };
const calc = new DiscountCalculator();

describe("DiscountCalculator", () => {
  it("computes discount amount and final price for a single discount", () => {
    const r = calc.execute({ mode: "apply", originalPrice: 200, finalPrice: 0, discounts: [25] }, context);
    expect(r.data.discountAmount).toBe(50);
    expect(r.data.finalPrice).toBe(150);
    expect(r.data.saved).toBe(50);
    expect(r.data.effectiveDiscountPercent).toBe(25);
  });

  it("handles zero discount", () => {
    const r = calc.execute({ mode: "apply", originalPrice: 100, finalPrice: 0, discounts: [0] }, context);
    expect(r.data.finalPrice).toBe(100);
  });

  it("applies stacked discounts sequentially, not additively", () => {
    const r = calc.execute({ mode: "apply", originalPrice: 100, finalPrice: 0, discounts: [30, 10] }, context);
    expect(r.data.finalPrice).toBe(63);
    expect(r.data.saved).toBe(37);
    expect(r.data.effectiveDiscountPercent).toBe(37);
  });

  it("reverse-engineers the original price from a final price and discount rate", () => {
    const r = calc.execute({ mode: "reverse", originalPrice: 0, finalPrice: 70, discounts: [30] }, context);
    expect(r.data.originalPrice).toBe(100);
    expect(r.data.saved).toBe(30);
  });

  it("clamps an out-of-range discount rate in reverse mode to avoid dividing by zero", () => {
    const r = calc.execute({ mode: "reverse", originalPrice: 0, finalPrice: 50, discounts: [100] }, context);
    expect(Number.isFinite(r.data.originalPrice)).toBe(true);
  });
});
