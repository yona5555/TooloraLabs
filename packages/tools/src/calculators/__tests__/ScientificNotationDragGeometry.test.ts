import { describe, expect, it } from "vitest";
import { snapToScientificNotation } from "../ScientificNotationDragGeometry";

describe("snapToScientificNotation", () => {
  it("rounds the exponent to the nearest whole number", () => {
    expect(snapToScientificNotation(3, 5.4, -12, 21)).toEqual({ coefficient: 3, exponent: 5 });
    expect(snapToScientificNotation(3, 5.6, -12, 21)).toEqual({ coefficient: 3, exponent: 6 });
  });

  it("rounds the coefficient to one decimal place", () => {
    expect(snapToScientificNotation(4.27, 0, -12, 21)).toEqual({ coefficient: 4.3, exponent: 0 });
  });

  it("clamps the exponent to the given range", () => {
    expect(snapToScientificNotation(5, 100, -12, 21)).toEqual({ coefficient: 5, exponent: 21 });
    expect(snapToScientificNotation(5, -100, -12, 21)).toEqual({ coefficient: 5, exponent: -12 });
  });

  it("clamps the coefficient to [1, 9.9], never 0 or >= 10", () => {
    expect(snapToScientificNotation(0, 4, -12, 21)).toEqual({ coefficient: 1, exponent: 4 });
    expect(snapToScientificNotation(15, 4, -12, 21)).toEqual({ coefficient: 9.9, exponent: 4 });
  });
});
