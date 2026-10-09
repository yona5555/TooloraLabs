import { describe, it, expect } from "vitest";
import {
  normalizeSci,
  reciprocalSci,
  engineeringOf,
  standardValueOf,
  normalizationSteps,
  nearestSiPrefix,
  NAMED_MAGNITUDES,
  SI_PREFIXES,
  ORDERS_OF_MAGNITUDE,
  REAL_WORLD_SPEEDS,
} from "../ScientificNotationConverterGraph";

describe("ScientificNotationConverterGraph", () => {
  it("normalizeSci renormalizes an out-of-range coefficient", () => {
    expect(normalizeSci(29.9792458, 7)).toEqual({ coefficient: 2.99792458, exponent: 8 });
  });

  it("normalizeSci renormalizes a too-small coefficient", () => {
    expect(normalizeSci(0.5, 3)).toEqual({ coefficient: 5, exponent: 2 });
  });

  it("reciprocalSci computes 1/(2x10^3) = 5x10^-4", () => {
    const r = reciprocalSci(2, 3);
    expect(r.coefficient).toBeCloseTo(5, 10);
    expect(r.exponent).toBe(-4);
  });

  it("reciprocalSci of zero returns zero", () => {
    expect(reciprocalSci(0, 5)).toEqual({ coefficient: 0, exponent: 0 });
  });

  it("engineeringOf converts 2.99792458x10^8 to engineering form (exponent multiple of 3)", () => {
    const eng = engineeringOf(2.99792458, 8);
    expect(eng.exponent % 3).toBe(0);
    expect(eng.coefficient).toBeCloseTo(299.792458, 5);
    expect(eng.exponent).toBe(6);
  });

  it("standardValueOf recovers the real number from coefficient/exponent", () => {
    expect(standardValueOf(2.99792458, 8)).toBeCloseTo(299792458, 0);
  });

  it("normalizationSteps traces a real digit-shift path for a large number", () => {
    const steps = normalizationSteps(299792458);
    expect(steps[0]).toEqual({ coefficient: 299792458, exponent: 0 });
    const last = steps[steps.length - 1];
    expect(Math.abs(last.coefficient)).toBeGreaterThanOrEqual(1);
    expect(Math.abs(last.coefficient)).toBeLessThan(10);
    expect(last.exponent).toBe(8);
  });

  it("normalizationSteps traces a real digit-shift path for a small number", () => {
    const steps = normalizationSteps(0.0000456);
    const last = steps[steps.length - 1];
    expect(Math.abs(last.coefficient)).toBeGreaterThanOrEqual(1);
    expect(Math.abs(last.coefficient)).toBeLessThan(10);
    expect(last.exponent).toBe(-5);
  });

  it("normalizationSteps handles zero without looping", () => {
    expect(normalizationSteps(0)).toEqual([{ coefficient: 0, exponent: 0 }]);
  });

  it("nearestSiPrefix finds kilo for exponent 3", () => {
    expect(nearestSiPrefix(3).symbol).toBe("k");
  });

  it("nearestSiPrefix finds nearest even when exponent isn't a multiple of 3", () => {
    expect(nearestSiPrefix(8).symbol).toBe("G");
  });

  it("reference tables are well-formed and sorted sensibly", () => {
    expect(NAMED_MAGNITUDES.length).toBe(9);
    expect(SI_PREFIXES.length).toBe(17);
    expect(ORDERS_OF_MAGNITUDE.length).toBeGreaterThan(5);
    expect(REAL_WORLD_SPEEDS.find((s) => s.key === "lightSpeed")?.metersPerSecond).toBe(299792458);
  });
});
