import { describe, it, expect } from "vitest";
import {
  formatMathValue,
  toMathValueFraction,
  roundSignificant,
  snapDragValue,
  evalPoly,
  derivPolyCoeffs,
  polyDegree,
  solveLinearRoot,
  solveQuadraticRoots,
  quadraticVertex,
  vietaFromQuadratic,
  newtonIterate,
  findRealRootsNumerically,
  deriveHeroEquation,
  type MathSolverNumericDraft,
} from "../StepByStepMathSolverGraph";

describe("formatMathValue", () => {
  it("never shows NaN, Infinity, -0, or undefined", () => {
    expect(formatMathValue(NaN)).not.toContain("NaN");
    expect(formatMathValue(Infinity)).not.toContain("Infinity");
    expect(formatMathValue(-Infinity)).not.toContain("Infinity");
    expect(formatMathValue(-0)).toBe("0");
    expect(formatMathValue(undefined)).toBe("0");
    expect(formatMathValue(null)).toBe("0");
  });

  it("prefers a simple fraction for cleanly rational values", () => {
    expect(formatMathValue(1 / 3)).toBe("1/3");
    expect(formatMathValue(2.5)).toBe("5/2");
    expect(formatMathValue(0.1)).toBe("1/10");
    expect(formatMathValue(-0.75)).toBe("-3/4");
  });

  it("falls back to 4 significant figures for non-nice decimals", () => {
    expect(formatMathValue(Math.sqrt(2))).not.toMatch(/\d{5,}/);
    expect(formatMathValue(Math.PI)).not.toContain("3.14159265358979");
  });

  it("returns clean integers without a denominator", () => {
    expect(formatMathValue(4)).toBe("4");
    expect(formatMathValue(-7)).toBe("-7");
    expect(formatMathValue(0)).toBe("0");
  });

  it("never emits a raw long decimal string", () => {
    const weird = 1 / 7;
    const out = formatMathValue(weird);
    expect(out.replace(".", "").replace("-", "").length).toBeLessThanOrEqual(5);
  });
});

describe("toMathValueFraction", () => {
  it("rejects values that are not nicely rational within the denominator bound", () => {
    expect(toMathValueFraction(Math.sqrt(2), 99)).toBeNull();
  });
  it("accepts exact integers as den=1", () => {
    expect(toMathValueFraction(5)).toEqual({ num: 5, den: 1 });
  });
});

describe("roundSignificant", () => {
  it("handles zero and negative zero", () => {
    expect(roundSignificant(0)).toBe(0);
    expect(roundSignificant(-0)).toBe(0);
  });
  it("handles non-finite input defensively", () => {
    expect(roundSignificant(NaN)).toBe(0);
    expect(roundSignificant(Infinity)).toBe(0);
  });
});

describe("snapDragValue", () => {
  it("snaps near-integers to the integer", () => {
    expect(snapDragValue(3.97)).toBe(4);
    expect(snapDragValue(-2.05)).toBe(-2);
  });
  it("otherwise snaps to the given step", () => {
    expect(snapDragValue(3.3, 0.5)).toBe(3.5);
  });
  it("never returns -0", () => {
    expect(Object.is(snapDragValue(-0.01), -0)).toBe(false);
  });
});

describe("evalPoly / derivPolyCoeffs / polyDegree", () => {
  it("evaluates ascending-power coefficients correctly", () => {
    // 2x^2 - 4x - 6
    expect(evalPoly([-6, -4, 2], 0)).toBe(-6);
    expect(evalPoly([-6, -4, 2], 3)).toBe(2 * 9 - 4 * 3 - 6);
  });
  it("differentiates termwise", () => {
    expect(derivPolyCoeffs([-6, -4, 2])).toEqual([-4, 4]);
  });
  it("finds the true degree ignoring trailing zero coefficients", () => {
    expect(polyDegree([1, 2, 0, 0])).toBe(1);
    expect(polyDegree([0, 0, 0])).toBe(0);
  });
});

describe("solveLinearRoot", () => {
  it("solves a normal line", () => {
    expect(solveLinearRoot(-6, 2)).toBe(3);
  });
  it("returns null for a degenerate (horizontal) line — no unique root", () => {
    expect(solveLinearRoot(5, 0)).toBeNull();
  });
});

describe("solveQuadraticRoots", () => {
  it("default example 2x^2 - 4x - 6 = 0 has roots -1 and 3", () => {
    const r = solveQuadraticRoots(-6, -4, 2);
    expect(r.kind).toBe("two-real");
    if (r.kind === "two-real") {
      const roots = [r.x1, r.x2].sort((a, b) => a - b);
      expect(roots[0]).toBeCloseTo(-1, 9);
      expect(roots[1]).toBeCloseTo(3, 9);
    }
  });

  it("a=0 degenerate case does not crash and still returns a result", () => {
    const r = solveQuadraticRoots(4, 2, 0);
    expect(["two-real", "one-real", "complex"]).toContain(r.kind);
    if (r.kind === "two-real") {
      expect(Number.isFinite(r.x1)).toBe(true);
      expect(Number.isFinite(r.x2)).toBe(true);
    }
  });

  it("negative discriminant gives complex conjugate roots", () => {
    const r = solveQuadraticRoots(5, 2, 1); // x^2+2x+5, D=4-20=-16
    expect(r.kind).toBe("complex");
    if (r.kind === "complex") {
      expect(r.re).toBeCloseTo(-1, 9);
      expect(r.im).toBeCloseTo(2, 9);
    }
  });

  it("zero discriminant gives a repeated root", () => {
    const r = solveQuadraticRoots(4, -4, 1); // x^2-4x+4=(x-2)^2
    expect(r.kind).toBe("one-real");
    if (r.kind === "one-real") expect(r.x).toBeCloseTo(2, 9);
  });

  it("handles fractional coefficients", () => {
    const r = solveQuadraticRoots(-1 / 4, 0, 1); // x^2 - 1/4 = 0 -> x = +-1/2
    expect(r.kind).toBe("two-real");
    if (r.kind === "two-real") {
      const roots = [r.x1, r.x2].sort((a, b) => a - b);
      expect(roots[0]).toBeCloseTo(-0.5, 9);
      expect(roots[1]).toBeCloseTo(0.5, 9);
    }
  });

  it("handles very large coefficients without overflow to non-finite", () => {
    const r = solveQuadraticRoots(-6e10, -4e5, 2);
    if (r.kind === "two-real") {
      expect(Number.isFinite(r.x1)).toBe(true);
      expect(Number.isFinite(r.x2)).toBe(true);
    }
  });
});

describe("quadraticVertex / vietaFromQuadratic", () => {
  it("default example vertex is (1, -8)", () => {
    const v = quadraticVertex(-6, -4, 2);
    expect(v.x).toBeCloseTo(1, 9);
    expect(v.y).toBeCloseTo(-8, 9);
  });
  it("Vieta sum/product match the closed-form roots", () => {
    const { sum, product } = vietaFromQuadratic(-6, -4, 2);
    expect(sum).toBeCloseTo(2, 9); // -1 + 3
    expect(product).toBeCloseTo(-3, 9); // -1 * 3
  });
});

describe("newtonIterate", () => {
  it("converges to a known root of the default quadratic", () => {
    const steps = newtonIterate([-6, -4, 2], 5, 10);
    const last = steps[steps.length - 1];
    expect(Math.abs(last.fx)).toBeLessThan(1e-6);
  });
  it("terminates (does not loop forever) when the derivative is ~0", () => {
    const steps = newtonIterate([1, 0, 0, 1], 0, 50); // f=x^3+1, f'=3x^2, f'(0)=0
    expect(steps.length).toBeLessThanOrEqual(51);
  });
});

describe("findRealRootsNumerically", () => {
  it("finds the two real roots of a cubic-derived case (degree 3) within tolerance", () => {
    // (x-1)(x-2)(x-3) = x^3 -6x^2+11x-6, ascending: [-6,11,-6,1]
    const roots = findRealRootsNumerically([-6, 11, -6, 1], [-5, 5]);
    expect(roots.length).toBe(3);
    const sorted = roots.sort((a, b) => a - b);
    expect(sorted[0]).toBeCloseTo(1, 2);
    expect(sorted[1]).toBeCloseTo(2, 2);
    expect(sorted[2]).toBeCloseTo(3, 2);
  });
});

describe("deriveHeroEquation", () => {
  const base: MathSolverNumericDraft = {
    mode: "linear-equation",
    linearA: 3,
    linearB: 5,
    linearC: 2,
    linearD: 9,
    quadA: 2,
    quadB: -4,
    quadC: -6,
    fracA: 1,
    fracB: 2,
    fracOp: "add",
    fracC: 1,
    fracD: 3,
    polynomialTerms: [
      { coefficient: 3, power: 2 },
      { coefficient: 2, power: 1 },
      { coefficient: 5, power: 0 },
    ],
  };

  it("linear-equation: ax+b=cx+d becomes (a-c)x+(b-d)=0", () => {
    const eq = deriveHeroEquation(base);
    expect(eq.degree).toBe(1);
    expect(eq.coeffs).toEqual([5 - 9, 3 - 2]);
    expect(eq.isClosedForm).toBe(true);
  });

  it("quadratic-equation: ax^2+bx+c=0 maps directly, default example matches spec (-1, 3 roots)", () => {
    const eq = deriveHeroEquation({ ...base, mode: "quadratic-equation" });
    expect(eq.degree).toBe(2);
    expect(eq.coeffs).toEqual([-6, -4, 2]);
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    expect(r.kind).toBe("two-real");
  });

  it("fraction-operation: reframed as x - result = 0, root equals the real fraction value", () => {
    const eq = deriveHeroEquation({ ...base, mode: "fraction-operation" });
    expect(eq.degree).toBe(1);
    const root = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
    expect(root).toBeCloseTo(1 / 2 + 1 / 3, 9);
  });

  it("derivative: builds a polynomial from the live term list, degree = highest integer power", () => {
    const eq = deriveHeroEquation({ ...base, mode: "derivative" });
    expect(eq.degree).toBe(2);
    expect(eq.isClosedForm).toBe(true);
    expect(evalPoly(eq.coeffs, 0)).toBeCloseTo(5, 9);
  });

  it("every mode produces a finite, non-empty label with no NaN/undefined text", () => {
    for (const mode of ["linear-equation", "quadratic-equation", "fraction-operation", "derivative"] as const) {
      const eq = deriveHeroEquation({ ...base, mode });
      expect(eq.label.length).toBeGreaterThan(0);
      expect(eq.label).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
});
