import { describe, it, expect } from "vitest";
import { DensityCalculator } from "../DensityCalculator";

const context = { locale: "en-US" };
const calc = new DensityCalculator();
const base = { operation: "solveDensity" as const, mass: 0, volume: 0, density: 0 };

describe("DensityCalculator", () => {
  it("solves for density given mass and volume", () => {
    const r = calc.execute({ ...base, operation: "solveDensity", mass: 100, volume: 50 }, context);
    expect(r.data.density).toBe(2);
    expect(r.data.densitySI).toBe(2000);
  });

  it("computes specific gravity relative to water", () => {
    const r = calc.execute({ ...base, operation: "solveDensity", mass: 193, volume: 10 }, context);
    expect(r.data.density).toBe(19.3);
    expect(r.data.specificGravity).toBe(19.3);
  });

  it("solves for mass given density and volume", () => {
    const r = calc.execute({ ...base, operation: "solveMass", density: 7.87, volume: 10 }, context);
    expect(r.data.mass).toBe(78.7);
  });

  it("solves for volume given mass and density", () => {
    const r = calc.execute({ ...base, operation: "solveVolume", mass: 78.7, density: 7.87 }, context);
    expect(r.data.volume).toBe(10);
  });

  it("flags a zero volume when solving for density", () => {
    const r = calc.execute({ ...base, operation: "solveDensity", mass: 100, volume: 0 }, context);
    expect(r.data.error).toBe("zero-volume");
  });

  it("flags a zero density when solving for volume", () => {
    const r = calc.execute({ ...base, operation: "solveVolume", mass: 100, density: 0 }, context);
    expect(r.data.error).toBe("zero-density");
  });

  it("handles a density less than water (floats)", () => {
    const r = calc.execute({ ...base, operation: "solveDensity", mass: 0.92, volume: 1 }, context);
    expect(r.data.density).toBe(0.92);
    expect(r.data.specificGravity).toBe(0.92);
  });
});
