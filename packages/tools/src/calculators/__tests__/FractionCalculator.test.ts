import { describe, it, expect } from "vitest";
import { FractionCalculator } from "../FractionCalculator";

const context = { locale: "en-US" };
const calc = new FractionCalculator();

describe("FractionCalculator", () => {
  it("adds two fractions with different denominators", () => {
    const r = calc.execute({ operation: "add", numeratorA: 1, denominatorA: 2, numeratorB: 1, denominatorB: 3 }, context);
    expect(r.data.result).toEqual({ numerator: 5, denominator: 6 });
    expect(r.data.commonDenominator).toBe(6);
    expect(r.data.scaledNumeratorA).toBe(3);
    expect(r.data.scaledNumeratorB).toBe(2);
  });

  it("subtracts two fractions", () => {
    const r = calc.execute({ operation: "subtract", numeratorA: 3, denominatorA: 4, numeratorB: 1, denominatorB: 4 }, context);
    expect(r.data.result).toEqual({ numerator: 1, denominator: 2 });
  });

  it("multiplies two fractions", () => {
    const r = calc.execute({ operation: "multiply", numeratorA: 2, denominatorA: 3, numeratorB: 3, denominatorB: 4 }, context);
    expect(r.data.result).toEqual({ numerator: 1, denominator: 2 });
  });

  it("divides two fractions", () => {
    const r = calc.execute({ operation: "divide", numeratorA: 1, denominatorA: 2, numeratorB: 1, denominatorB: 4 }, context);
    expect(r.data.result).toEqual({ numerator: 2, denominator: 1 });
    expect(r.data.isWholeNumber).toBe(true);
  });

  it("simplifies already-reducible inputs before operating", () => {
    const r = calc.execute({ operation: "add", numeratorA: 2, denominatorA: 4, numeratorB: 1, denominatorB: 4 }, context);
    expect(r.data.simplifiedA).toEqual({ numerator: 1, denominator: 2 });
    expect(r.data.result).toEqual({ numerator: 3, denominator: 4 });
  });

  it("flags a zero denominator as an error", () => {
    const r = calc.execute({ operation: "add", numeratorA: 1, denominatorA: 0, numeratorB: 1, denominatorB: 2 }, context);
    expect(r.data.error).toBe("zero-denominator");
  });

  it("flags dividing by a zero fraction as an error", () => {
    const r = calc.execute({ operation: "divide", numeratorA: 1, denominatorA: 2, numeratorB: 0, denominatorB: 5 }, context);
    expect(r.data.error).toBe("divide-by-zero");
  });

  it("produces a mixed number for an improper result", () => {
    const r = calc.execute({ operation: "add", numeratorA: 3, denominatorA: 2, numeratorB: 3, denominatorB: 2 }, context);
    expect(r.data.result).toEqual({ numerator: 3, denominator: 1 });
    expect(r.data.isWholeNumber).toBe(true);
    expect(r.data.mixed).toBeNull();
  });

  it("produces a mixed number with a nonzero remainder", () => {
    const r = calc.execute({ operation: "add", numeratorA: 3, denominatorA: 2, numeratorB: 1, denominatorB: 4 }, context);
    expect(r.data.result).toEqual({ numerator: 7, denominator: 4 });
    expect(r.data.mixed).toEqual({ whole: 1, numerator: 3, denominator: 4 });
    expect(r.data.isImproper).toBe(true);
  });

  it("handles negative fractions, keeping the sign on the numerator", () => {
    const r = calc.execute({ operation: "add", numeratorA: -1, denominatorA: 2, numeratorB: 1, denominatorB: 4 }, context);
    expect(r.data.result).toEqual({ numerator: -1, denominator: 4 });
  });

  it("normalizes a negative denominator onto the numerator", () => {
    const r = calc.execute({ operation: "multiply", numeratorA: 1, denominatorA: -2, numeratorB: 1, denominatorB: 3 }, context);
    expect(r.data.simplifiedA).toEqual({ numerator: -1, denominator: 2 });
  });

  it("computes the decimal equivalent of the result", () => {
    const r = calc.execute({ operation: "divide", numeratorA: 1, denominatorA: 3, numeratorB: 1, denominatorB: 1 }, context);
    expect(r.data.decimal).toBeCloseTo(0.333333, 5);
  });
});
