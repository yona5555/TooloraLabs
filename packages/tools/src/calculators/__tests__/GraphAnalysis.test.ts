import { describe, expect, it } from "vitest";
import { analyzeGraph, compileFunction, derivativeAt, differenceQuotient, riemannSum, secondDerivativeAt, tangentAt } from "../GraphAnalysis";

function fn(expr: string) {
  const f = compileFunction(expr);
  if (!f) throw new Error("parse failed");
  return f;
}

describe("compileFunction", () => {
  it("returns null for an invalid expression", () => {
    expect(compileFunction("2 +* x")).toBeNull();
  });
  it("returns null where the function is undefined", () => {
    expect(fn("sqrt(x)")(-1)).toBeNull();
    expect(fn("1/x")(0)).toBeNull();
  });
});

describe("derivatives", () => {
  it("differentiates a cubic", () => {
    const f = fn("x^3 - 3*x");
    expect(derivativeAt(f, 2)).toBeCloseTo(9, 5);
    expect(secondDerivativeAt(f, 2)).toBeCloseTo(12, 2);
  });
  it("difference quotient approaches the derivative", () => {
    const f = fn("x^2");
    expect(differenceQuotient(f, 3, 1)).toBeCloseTo(7, 10);
    expect(differenceQuotient(f, 3, 0.001)).toBeCloseTo(6.001, 6);
  });
  it("builds the tangent line", () => {
    const t = tangentAt(fn("x^2"), 1)!;
    expect(t.slope).toBeCloseTo(2, 6);
    expect(t.intercept).toBeCloseTo(-1, 6);
    expect(t.angleDeg).toBeCloseTo(63.4349, 3);
  });
});

describe("riemannSum", () => {
  const f = fn("x^2");
  it("left/right/midpoint/trapezoid bracket the exact integral", () => {
    expect(riemannSum(f, 0, 3, 3, "left")).toBeCloseTo(5, 10);
    expect(riemannSum(f, 0, 3, 3, "right")).toBeCloseTo(14, 10);
    expect(riemannSum(f, 0, 3, 3, "midpoint")).toBeCloseTo(8.75, 10);
    expect(riemannSum(f, 0, 3, 3, "trapezoid")).toBeCloseTo(9.5, 10);
  });
  it("Simpson is exact for a quadratic", () => {
    expect(riemannSum(f, 0, 3, 4, "simpson")).toBeCloseTo(9, 10);
  });
});

describe("analyzeGraph", () => {
  it("finds roots, extrema and the inflection point of x^3 - 3x", () => {
    const a = analyzeGraph(fn("x^3 - 3*x"), -3, 3);
    expect(a.roots).toHaveLength(3);
    expect(a.roots[0]).toBeCloseTo(-Math.sqrt(3), 6);
    expect(a.roots[1]).toBeCloseTo(0, 6);
    expect(a.roots[2]).toBeCloseTo(Math.sqrt(3), 6);
    expect(a.maxima).toHaveLength(1);
    expect(a.maxima[0].x).toBeCloseTo(-1, 4);
    expect(a.maxima[0].y).toBeCloseTo(2, 6);
    expect(a.minima[0].x).toBeCloseTo(1, 4);
    expect(a.minima[0].y).toBeCloseTo(-2, 6);
    expect(a.inflections).toHaveLength(1);
    expect(a.inflections[0].x).toBeCloseTo(0, 6);
    expect(a.symmetry).toBe("odd");
    expect(a.signedArea).toBeCloseTo(0, 4);
    expect(a.yIntercept).toBe(0);
  });

  it("integrates x^2 and detects even symmetry", () => {
    const a = analyzeGraph(fn("x^2"), -3, 3);
    expect(a.signedArea).toBeCloseTo(18, 2);
    expect(a.negativeArea).toBe(0);
    expect(a.averageValue).toBeCloseTo(3, 2);
    expect(a.symmetry).toBe("even");
    expect(a.minima).toHaveLength(1);
    expect(a.maxima).toHaveLength(0);
    expect(a.concaveUpRatio).toBeGreaterThan(0.99);
  });

  it("does not invent roots or extrema at the asymptote of 1/x", () => {
    const a = analyzeGraph(fn("1/x"), -10, 10, 600);
    expect(a.roots).toHaveLength(0);
    expect(a.maxima).toHaveLength(0);
    expect(a.minima).toHaveLength(0);
    expect(a.breakCount).toBeGreaterThanOrEqual(1);
    expect(a.symmetry).toBe("odd");
  });

  it("reports intervals of increase and decrease for sin(x)", () => {
    const a = analyzeGraph(fn("sin(x)"), 0, 2 * Math.PI);
    expect(a.intervals.map((i) => i.trend)).toEqual(["up", "down", "up"]);
    expect(a.intervals[0].to).toBeCloseTo(Math.PI / 2, 1);
    expect(a.positiveArea).toBeCloseTo(2, 3);
    expect(a.negativeArea).toBeCloseTo(2, 3);
  });

  it("marks undefined samples of sqrt(x) on a range that starts negative", () => {
    const a = analyzeGraph(fn("sqrt(x)"), -4, 4, 401);
    expect(a.definedRatio).toBeGreaterThan(0.49);
    expect(a.definedRatio).toBeLessThan(0.52);
    expect(a.increasingRatio).toBeGreaterThan(0.99);
  });
});
