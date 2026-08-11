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

  it("rounds each person's total up to a whole unit when requested, absorbing the extra into the tip", () => {
    const r = calc.execute({ billAmount: 50, tipPercent: 18, people: 3, roundUpPerPerson: true }, context);
    expect(r.data.totalPerPerson).toBe(20);
    expect(r.data.totalAmount).toBe(60);
    expect(r.data.tipAmount).toBe(10);
    expect(r.data.roundedUp).toBe(true);
  });

  it("does not round up by default", () => {
    const r = calc.execute({ billAmount: 50, tipPercent: 18, people: 3 }, context);
    expect(r.data.roundedUp).toBe(false);
    expect(r.data.totalPerPerson).toBe(19.67);
  });
});
