import { describe, it, expect } from "vitest";
import { StoichiometryCalculator } from "../StoichiometryCalculator";

const context = { locale: "en-US" };
const calc = new StoichiometryCalculator();

describe("StoichiometryCalculator", () => {
  it("converts grams of H2 to grams of H2O for 2H2 + O2 -> 2H2O", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 2, knownAmount: 4, knownUnit: "grams", targetFormula: "H2O", targetCoefficient: 2, targetUnit: "grams" },
      context
    );
    expect(r.data.error).toBeNull();
    expect(r.data.knownMolarMass).toBeCloseTo(2.016, 5);
    expect(r.data.knownMoles).toBeCloseTo(1.984127, 5);
    expect(r.data.targetMoles).toBeCloseTo(1.984127, 5);
    expect(r.data.targetAmount).toBeCloseTo(35.744, 2);
  });

  it("converts moles to moles using the mole ratio for N2 + 3H2 -> 2NH3", () => {
    const r = calc.execute(
      { knownFormula: "N2", knownCoefficient: 1, knownAmount: 2, knownUnit: "moles", targetFormula: "NH3", targetCoefficient: 2, targetUnit: "moles" },
      context
    );
    expect(r.data.knownMoles).toBe(2);
    expect(r.data.targetMoles).toBe(4);
    expect(r.data.targetAmount).toBe(4);
  });

  it("converts grams to moles", () => {
    const r = calc.execute(
      { knownFormula: "O2", knownCoefficient: 1, knownAmount: 32, knownUnit: "grams", targetFormula: "H2", targetCoefficient: 2, targetUnit: "moles" },
      context
    );
    expect(r.data.knownMolarMass).toBeCloseTo(31.998, 3);
    expect(r.data.knownMoles).toBeCloseTo(1.0000625, 5);
    expect(r.data.targetMoles).toBeCloseTo(2.000125, 4);
    expect(r.data.targetAmount).toBeCloseTo(2.000125, 4);
  });

  it("handles a 1:1 mole ratio identically for known and target", () => {
    const r = calc.execute(
      { knownFormula: "NaCl", knownCoefficient: 1, knownAmount: 1, knownUnit: "moles", targetFormula: "NaCl", targetCoefficient: 1, targetUnit: "grams" },
      context
    );
    expect(r.data.targetAmount).toBeCloseTo(58.44, 2);
  });

  it("returns zero amounts for a zero known amount without erroring", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 2, knownAmount: 0, knownUnit: "moles", targetFormula: "H2O", targetCoefficient: 2, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBeNull();
    expect(r.data.targetMoles).toBe(0);
  });

  it("flags an invalid known formula", () => {
    const r = calc.execute(
      { knownFormula: "Xx2", knownCoefficient: 1, knownAmount: 1, knownUnit: "moles", targetFormula: "H2O", targetCoefficient: 1, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBe("invalid-known-formula");
  });

  it("flags an invalid target formula", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 1, knownAmount: 1, knownUnit: "moles", targetFormula: "Xx2", targetCoefficient: 1, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBe("invalid-target-formula");
  });

  it("flags a zero known coefficient", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 0, knownAmount: 1, knownUnit: "moles", targetFormula: "H2O", targetCoefficient: 1, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBe("invalid-coefficient");
  });

  it("flags a negative target coefficient", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 1, knownAmount: 1, knownUnit: "moles", targetFormula: "H2O", targetCoefficient: -2, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBe("invalid-coefficient");
  });

  it("flags a negative known amount", () => {
    const r = calc.execute(
      { knownFormula: "H2", knownCoefficient: 1, knownAmount: -1, knownUnit: "moles", targetFormula: "H2O", targetCoefficient: 1, targetUnit: "moles" },
      context
    );
    expect(r.data.error).toBe("invalid-amount");
  });
});
