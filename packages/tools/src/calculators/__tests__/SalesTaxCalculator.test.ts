import { describe, it, expect } from "vitest";
import { SalesTaxCalculator } from "../SalesTaxCalculator";

const context = { locale: "en-US" };
const calc = new SalesTaxCalculator();

describe("SalesTaxCalculator", () => {
  it("computes tax amount and total price", () => {
    const r = calc.execute({ mode: "add", price: 100, totalPrice: 0, taxRate: 8 }, context);
    expect(r.data.taxAmount).toBe(8);
    expect(r.data.totalPrice).toBe(108);
  });

  it("handles zero tax rate", () => {
    const r = calc.execute({ mode: "add", price: 50, totalPrice: 0, taxRate: 0 }, context);
    expect(r.data.totalPrice).toBe(50);
  });

  it("backs out the pre-tax price from a tax-inclusive total", () => {
    const r = calc.execute({ mode: "reverse", price: 0, totalPrice: 108, taxRate: 8 }, context);
    expect(r.data.price).toBe(100);
    expect(r.data.taxAmount).toBe(8);
  });

  it("clamps a negative tax rate to zero", () => {
    const r = calc.execute({ mode: "add", price: 50, totalPrice: 0, taxRate: -5 }, context);
    expect(r.data.taxAmount).toBe(0);
    expect(r.data.totalPrice).toBe(50);
  });
});
