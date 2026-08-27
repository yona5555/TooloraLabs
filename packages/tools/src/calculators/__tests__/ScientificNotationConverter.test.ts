import { describe, it, expect } from "vitest";
import { ScientificNotationConverter } from "../ScientificNotationConverter";

const context = { locale: "en-US" };
const calc = new ScientificNotationConverter();

describe("ScientificNotationConverter", () => {
  it("converts a large standard number to scientific notation", () => {
    const r = calc.execute(
      { operation: "toScientific", standardValue: 123400000, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 1.234, exponent: 8 });
  });

  it("converts a small standard number to scientific notation", () => {
    const r = calc.execute(
      { operation: "toScientific", standardValue: 0.00056, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 5.6, exponent: -4 });
  });

  it("handles zero", () => {
    const r = calc.execute(
      { operation: "toScientific", standardValue: 0, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 0, exponent: 0 });
    expect(r.data.standard).toBe(0);
  });

  it("expands an already-normalized coefficient/exponent pair to standard form", () => {
    const r = calc.execute(
      { operation: "toStandard", standardValue: 0, coefficientA: 2.5, exponentA: 4, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.standard).toBe(25000);
    expect(r.data.scientific).toEqual({ coefficient: 2.5, exponent: 4 });
  });

  it("expands an unnormalized coefficient/exponent pair without judging its form", () => {
    const r = calc.execute(
      { operation: "toStandard", standardValue: 0, coefficientA: 25, exponentA: 3, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.standard).toBe(25000);
    expect(r.data.scientific).toEqual({ coefficient: 2.5, exponent: 4 });
  });

  it("multiplies two scientific-notation values without renormalization needed", () => {
    const r = calc.execute(
      { operation: "multiply", standardValue: 0, coefficientA: 2, exponentA: 3, coefficientB: 3, exponentB: 4 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 6, exponent: 7 });
    expect(r.data.standard).toBe(60000000);
  });

  it("multiplies and renormalizes when the coefficient overflows 10", () => {
    const r = calc.execute(
      { operation: "multiply", standardValue: 0, coefficientA: 5, exponentA: 3, coefficientB: 3, exponentB: 4 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 1.5, exponent: 8 });
    expect(r.data.standard).toBe(150000000);
  });

  it("divides two scientific-notation values", () => {
    const r = calc.execute(
      { operation: "divide", standardValue: 0, coefficientA: 6, exponentA: 7, coefficientB: 2, exponentB: 3 },
      context
    );
    expect(r.data.scientific).toEqual({ coefficient: 3, exponent: 4 });
    expect(r.data.standard).toBe(30000);
  });

  it("flags division by a zero coefficient as an error", () => {
    const r = calc.execute(
      { operation: "divide", standardValue: 0, coefficientA: 6, exponentA: 7, coefficientB: 0, exponentB: 3 },
      context
    );
    expect(r.data.error).toBe("divide-by-zero");
  });

  it("produces engineering notation with an exponent that is a multiple of 3", () => {
    const r = calc.execute(
      { operation: "multiply", standardValue: 0, coefficientA: 2, exponentA: 3, coefficientB: 3, exponentB: 4 },
      context
    );
    expect(r.data.engineering).toEqual({ coefficient: 60, exponent: 6 });
    expect(r.data.numberName).toBe("million");
  });

  it("names a small-magnitude engineering result", () => {
    const r = calc.execute(
      { operation: "toScientific", standardValue: 0.000000123, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.engineering).toEqual({ coefficient: 123, exponent: -9 });
    expect(r.data.numberName).toBe("billionth");
  });

  it("has no number name for a value under 1,000", () => {
    const r = calc.execute(
      { operation: "toScientific", standardValue: 25, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 },
      context
    );
    expect(r.data.numberName).toBeNull();
  });
});
