import { describe, it, expect } from "vitest";
import { SalesTaxCalculator } from "../SalesTaxCalculator";

const context = { locale: "en-US" };
const calc = new SalesTaxCalculator();

describe("SalesTaxCalculator", () => {
  it("computes tax amount and total price", () => {
    const r = calc.execute({ price: 100, taxRate: 8 }, context);
    expect(r.data.taxAmount).toBe(8);
    expect(r.data.totalPrice).toBe(108);
  });

  it("handles zero tax rate", () => {
    const r = calc.execute({ price: 50, taxRate: 0 }, context);
    expect(r.data.totalPrice).toBe(50);
  });
});
