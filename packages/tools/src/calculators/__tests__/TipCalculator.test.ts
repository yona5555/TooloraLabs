import { describe, it, expect } from "vitest";
import { TipCalculator } from "../TipCalculator";

const context = { locale: "en-US" };
const calc = new TipCalculator();

describe("TipCalculator", () => {
  it("computes tip and total correctly", () => {
    const r = calc.execute({ billAmount: 100, tipPercent: 20, people: 1 }, context);
    expect(r.data.tipAmount).toBe(20);
    expect(r.data.totalAmount).toBe(120);
  });

  it("splits correctly between people", () => {
    const r = calc.execute({ billAmount: 100, tipPercent: 20, people: 4 }, context);
    expect(r.data.tipPerPerson).toBe(5);
    expect(r.data.totalPerPerson).toBe(30);
  });

  it("guards against zero or negative people", () => {
    const r = calc.execute({ billAmount: 100, tipPercent: 20, people: 0 }, context);
    expect(r.data.people).toBe(1);
  });
});
