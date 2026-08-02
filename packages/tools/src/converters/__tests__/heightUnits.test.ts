import { describe, it, expect } from "vitest";
import { feetInchesToCm, cmToFeetInches, lbToKg, kgToLb } from "../heightUnits";

describe("heightUnits", () => {
  it("converts feet+inches to cm", () => {
    expect(feetInchesToCm({ feet: 5, inches: 9 })).toBeCloseTo(175.26, 1);
    expect(feetInchesToCm({ feet: 6, inches: 0 })).toBeCloseTo(182.88, 1);
    expect(feetInchesToCm({ feet: 0, inches: 0 })).toBe(0);
  });

  it("converts cm to feet+inches", () => {
    expect(cmToFeetInches(175.26)).toEqual({ feet: 5, inches: 9 });
    expect(cmToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
  });

  it("never returns 12 or more inches (carries over into a whole foot)", () => {
    for (let cm = 50; cm <= 250; cm += 0.37) {
      const { inches } = cmToFeetInches(cm);
      expect(inches).toBeLessThan(12);
      expect(inches).toBeGreaterThanOrEqual(0);
    }
  });

  it("round-trips height within rounding tolerance", () => {
    const original = { feet: 5, inches: 11 };
    const cm = feetInchesToCm(original);
    const roundTripped = cmToFeetInches(cm);
    expect(roundTripped.feet).toBe(original.feet);
    expect(roundTripped.inches).toBeCloseTo(original.inches, 0);
  });

  it("converts pounds to kilograms and back", () => {
    expect(lbToKg(1)).toBeCloseTo(0.453592, 5);
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
    expect(kgToLb(lbToKg(150))).toBeCloseTo(150, 1);
  });

  it("handles zero weight", () => {
    expect(lbToKg(0)).toBe(0);
    expect(kgToLb(0)).toBe(0);
  });
});
