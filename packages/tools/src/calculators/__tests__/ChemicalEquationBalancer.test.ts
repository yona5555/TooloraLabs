import { describe, it, expect } from "vitest";
import { ChemicalEquationBalancer } from "../ChemicalEquationBalancer";

const context = { locale: "en-US" };
const calc = new ChemicalEquationBalancer();

function coeffsOf(terms: { formula: string; coefficient: number }[], formula: string) {
  return terms.find((t) => t.formula === formula)?.coefficient;
}

describe("ChemicalEquationBalancer", () => {
  it("balances the classic water-formation equation", () => {
    const r = calc.execute({ equation: "H2 + O2 -> H2O" }, context);
    expect(r.data.error).toBeNull();
    expect(coeffsOf(r.data.terms, "H2")).toBe(2);
    expect(coeffsOf(r.data.terms, "O2")).toBe(1);
    expect(coeffsOf(r.data.terms, "H2O")).toBe(2);
    expect(r.data.balancedEquation).toBe("2H2 + O2 → 2H2O");
  });

  it("balances ammonia synthesis (N2 + H2 -> NH3)", () => {
    const r = calc.execute({ equation: "N2 + H2 -> NH3" }, context);
    expect(coeffsOf(r.data.terms, "N2")).toBe(1);
    expect(coeffsOf(r.data.terms, "H2")).toBe(3);
    expect(coeffsOf(r.data.terms, "NH3")).toBe(2);
  });

  it("balances iron combustion (Fe + O2 -> Fe2O3)", () => {
    const r = calc.execute({ equation: "Fe + O2 -> Fe2O3" }, context);
    expect(coeffsOf(r.data.terms, "Fe")).toBe(4);
    expect(coeffsOf(r.data.terms, "O2")).toBe(3);
    expect(coeffsOf(r.data.terms, "Fe2O3")).toBe(2);
  });

  it("balances an equation with multiple products (combustion of methane)", () => {
    const r = calc.execute({ equation: "CH4 + O2 = CO2 + H2O" }, context);
    expect(coeffsOf(r.data.terms, "CH4")).toBe(1);
    expect(coeffsOf(r.data.terms, "O2")).toBe(2);
    expect(coeffsOf(r.data.terms, "CO2")).toBe(1);
    expect(coeffsOf(r.data.terms, "H2O")).toBe(2);
  });

  it("accepts the → arrow character directly", () => {
    const r = calc.execute({ equation: "H2 + O2 → H2O" }, context);
    expect(r.data.error).toBeNull();
    expect(coeffsOf(r.data.terms, "H2")).toBe(2);
  });

  it("leaves an already-balanced equation unchanged", () => {
    const r = calc.execute({ equation: "H2O -> H2O" }, context);
    expect(r.data.error).toBeNull();
    expect(coeffsOf(r.data.terms, "H2O")).toBe(1);
  });

  it("ignores any coefficients already present in the input", () => {
    const r = calc.execute({ equation: "2H2 + 1O2 -> 4H2O" }, context);
    expect(r.data.error).toBeNull();
    expect(coeffsOf(r.data.terms, "H2")).toBe(2);
    expect(coeffsOf(r.data.terms, "O2")).toBe(1);
    expect(coeffsOf(r.data.terms, "H2O")).toBe(2);
  });

  it("does not prefix a coefficient of 1 in the formatted equation", () => {
    const r = calc.execute({ equation: "N2 + H2 -> NH3" }, context);
    expect(r.data.balancedEquation.startsWith("N2")).toBe(true);
  });

  it("flags an empty equation", () => {
    const r = calc.execute({ equation: "" }, context);
    expect(r.data.error).toBe("empty-equation");
  });

  it("flags an equation with no arrow separator", () => {
    const r = calc.execute({ equation: "H2 + O2 H2O" }, context);
    expect(r.data.error).toBe("invalid-equation");
  });

  it("flags an unrecognized element symbol", () => {
    const r = calc.execute({ equation: "Xx2 + O2 -> Xx2O" }, context);
    expect(r.data.error).toBe("unknown-element");
  });

  it("flags an equation whose sides share no elements as unbalanceable", () => {
    const r = calc.execute({ equation: "H2 -> O2" }, context);
    expect(r.data.error).toBe("cannot-balance");
  });
});
