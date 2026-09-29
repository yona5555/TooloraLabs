import { describe, expect, it } from "vitest";
import { fractionToDecimal, snapToFraction } from "../FractionNumberLineGeometry";

describe("snapToFraction", () => {
  it("snaps a value already exactly on a twelfths grid to itself, simplified", () => {
    expect(snapToFraction(0.5, 12)).toEqual({ numerator: 1, denominator: 2 });
    expect(snapToFraction(1 / 3, 12)).toEqual({ numerator: 1, denominator: 3 });
  });

  it("snaps an arbitrary decimal to the nearest twelfth", () => {
    // 0.4 * 12 = 4.8 -> rounds to 5/12 (already in lowest terms)
    expect(snapToFraction(0.4, 12)).toEqual({ numerator: 5, denominator: 12 });
  });

  it("handles zero", () => {
    expect(snapToFraction(0, 12)).toEqual({ numerator: 0, denominator: 1 });
  });

  it("handles values above 1", () => {
    expect(snapToFraction(1.5, 12)).toEqual({ numerator: 3, denominator: 2 });
  });
});

describe("fractionToDecimal", () => {
  it("matches simple known fractions", () => {
    expect(fractionToDecimal({ numerator: 1, denominator: 4 })).toBe(0.25);
    expect(fractionToDecimal({ numerator: 3, denominator: 4 })).toBe(0.75);
  });

  it("returns 0 for a zero denominator instead of NaN/Infinity", () => {
    expect(fractionToDecimal({ numerator: 5, denominator: 0 })).toBe(0);
  });
});
