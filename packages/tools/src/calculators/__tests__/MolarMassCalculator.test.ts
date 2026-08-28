import { describe, it, expect } from "vitest";
import { MolarMassCalculator } from "../MolarMassCalculator";

const context = { locale: "en-US" };
const calc = new MolarMassCalculator();

describe("MolarMassCalculator", () => {
  it("computes the molar mass of water", () => {
    const r = calc.execute({ formula: "H2O" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.totalMass).toBeCloseTo(18.015, 5);
    expect(r.data.breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbol: "H", count: 2 }),
        expect.objectContaining({ symbol: "O", count: 1 }),
      ])
    );
  });

  it("computes the molar mass of a simple binary compound (NaCl)", () => {
    const r = calc.execute({ formula: "NaCl" }, context);
    expect(r.data.totalMass).toBeCloseTo(58.44, 5);
  });

  it("computes the molar mass of glucose (C6H12O6)", () => {
    const r = calc.execute({ formula: "C6H12O6" }, context);
    expect(r.data.totalMass).toBeCloseTo(180.156, 3);
  });

  it("handles a parenthesized group with a multiplier (Ca(OH)2)", () => {
    const r = calc.execute({ formula: "Ca(OH)2" }, context);
    expect(r.data.totalMass).toBeCloseTo(74.092, 3);
    const oxygen = r.data.breakdown.find((row) => row.symbol === "O");
    const hydrogen = r.data.breakdown.find((row) => row.symbol === "H");
    expect(oxygen?.count).toBe(2);
    expect(hydrogen?.count).toBe(2);
  });

  it("handles a bracketed group with a multiplier (Fe2(SO4)3)", () => {
    const r = calc.execute({ formula: "Fe2(SO4)3" }, context);
    expect(r.data.totalMass).toBeCloseTo(399.858, 2);
    const sulfur = r.data.breakdown.find((row) => row.symbol === "S");
    expect(sulfur?.count).toBe(3);
  });

  it("handles hydrate notation with a middle dot (CuSO4·5H2O)", () => {
    const r = calc.execute({ formula: "CuSO4·5H2O" }, context);
    expect(r.data.totalMass).toBeCloseTo(249.677, 2);
    const hydrogen = r.data.breakdown.find((row) => row.symbol === "H");
    expect(hydrogen?.count).toBe(10);
  });

  it("handles hydrate notation with a plain period", () => {
    const r = calc.execute({ formula: "CuSO4.5H2O" }, context);
    expect(r.data.totalMass).toBeCloseTo(249.677, 2);
  });

  it("treats an element with no explicit subscript as count 1", () => {
    const r = calc.execute({ formula: "NaCl" }, context);
    const na = r.data.breakdown.find((row) => row.symbol === "Na");
    expect(na?.count).toBe(1);
  });

  it("ignores whitespace in the formula", () => {
    const r = calc.execute({ formula: "H2 O" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.totalMass).toBeCloseTo(18.015, 5);
  });

  it("flags an empty formula", () => {
    const r = calc.execute({ formula: "" }, context);
    expect(r.data.error).toBe("empty-formula");
  });

  it("flags a whitespace-only formula", () => {
    const r = calc.execute({ formula: "   " }, context);
    expect(r.data.error).toBe("empty-formula");
  });

  it("flags an unrecognized element symbol", () => {
    const r = calc.execute({ formula: "Xx2O" }, context);
    expect(r.data.error).toBe("unknown-element");
  });

  it("flags unbalanced parentheses (missing close)", () => {
    const r = calc.execute({ formula: "Ca(OH2" }, context);
    expect(r.data.error).toBe("unbalanced-parentheses");
  });

  it("flags unbalanced parentheses (stray close)", () => {
    const r = calc.execute({ formula: "CaOH)2" }, context);
    expect(r.data.error).toBe("unbalanced-parentheses");
  });

  it("flags an invalid character in the formula", () => {
    const r = calc.execute({ formula: "H2O!" }, context);
    expect(r.data.error).toBe("invalid-formula");
  });
});
