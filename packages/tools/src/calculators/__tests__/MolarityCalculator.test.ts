import { describe, it, expect } from "vitest";
import { MolarityCalculator } from "../MolarityCalculator";

const context = { locale: "en-US" };
const calc = new MolarityCalculator();
const base = {
  mode: "concentration" as const,
  concentrationBasis: "moles" as const,
  moles: 0,
  massGrams: 0,
  molarMass: 0,
  volumeLiters: 0,
  dilutionSolveFor: "c2" as const,
  c1: 0,
  v1: 0,
  c2: 0,
  v2: 0,
};

describe("MolarityCalculator", () => {
  it("computes molarity from moles and volume", () => {
    const r = calc.execute({ ...base, mode: "concentration", concentrationBasis: "moles", moles: 0.5, volumeLiters: 2 }, context);
    expect(r.data.molarity).toBe(0.25);
  });

  it("computes molarity from mass and molar mass", () => {
    const r = calc.execute(
      { ...base, mode: "concentration", concentrationBasis: "mass", massGrams: 58.44, molarMass: 58.44, volumeLiters: 1 },
      context
    );
    expect(r.data.moles).toBe(1);
    expect(r.data.molarity).toBe(1);
  });

  it("solves C2 in a dilution problem", () => {
    const r = calc.execute({ ...base, mode: "dilution", dilutionSolveFor: "c2", c1: 2, v1: 0.5, v2: 1 }, context);
    expect(r.data.c2).toBe(1);
  });

  it("solves V2 in a dilution problem", () => {
    const r = calc.execute({ ...base, mode: "dilution", dilutionSolveFor: "v2", c1: 2, v1: 0.5, c2: 1 }, context);
    expect(r.data.v2).toBe(1);
  });

  it("solves C1 in a dilution problem", () => {
    const r = calc.execute({ ...base, mode: "dilution", dilutionSolveFor: "c1", v1: 0.5, c2: 1, v2: 1 }, context);
    expect(r.data.c1).toBe(2);
  });

  it("solves V1 in a dilution problem", () => {
    const r = calc.execute({ ...base, mode: "dilution", dilutionSolveFor: "v1", c1: 2, c2: 1, v2: 1 }, context);
    expect(r.data.v1).toBe(0.5);
  });

  it("flags zero volume when computing concentration", () => {
    const r = calc.execute({ ...base, mode: "concentration", concentrationBasis: "moles", moles: 0.5, volumeLiters: 0 }, context);
    expect(r.data.error).toBe("zero-volume");
  });

  it("flags zero molar mass when computing concentration from mass", () => {
    const r = calc.execute(
      { ...base, mode: "concentration", concentrationBasis: "mass", massGrams: 10, molarMass: 0, volumeLiters: 1 },
      context
    );
    expect(r.data.error).toBe("zero-molar-mass");
  });

  it("flags a zero denominator in a dilution problem", () => {
    const r = calc.execute({ ...base, mode: "dilution", dilutionSolveFor: "c2", c1: 2, v1: 0.5, v2: 0 }, context);
    expect(r.data.error).toBe("zero-denominator");
  });
});
