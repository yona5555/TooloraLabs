import { describe, it, expect } from "vitest";
import {
  bezout,
  bigOmega,
  commonDivisors,
  divisorsOf,
  euclidTiling,
  factorizeInt,
  gcdList,
  lcmList,
  ladderSteps,
  multiplesOf,
  primeExponentTable,
  relationKind,
} from "../GcfLcmEducationMath";
import { euclidSteps } from "../FractionCalculatorGraph";

describe("GcfLcmEducationMath", () => {
  it("reduces lists like the calculator", () => {
    expect(gcdList([12, 18, 24])).toBe(6);
    expect(lcmList([12, 18, 24])).toBe(72);
  });

  it("factorizes and counts prime factors", () => {
    expect(factorizeInt(360)).toEqual([
      { prime: 2, exponent: 3 },
      { prime: 3, exponent: 2 },
      { prime: 5, exponent: 1 },
    ]);
    expect(factorizeInt(1)).toEqual([]);
    expect(bigOmega(360)).toBe(6);
  });

  it("builds the min/max exponent table whose products are GCF and LCM", () => {
    const rows = primeExponentTable([12, 18]);
    expect(rows).toEqual([
      { prime: 2, exponents: [2, 1], min: 1, max: 2 },
      { prime: 3, exponents: [1, 2], min: 1, max: 2 },
    ]);
    const g = rows.reduce((p, r) => p * r.prime ** r.min, 1);
    const l = rows.reduce((p, r) => p * r.prime ** r.max, 1);
    expect([g, l]).toEqual([6, 36]);
  });

  it("runs Euclid and extended Euclid", () => {
    const steps = euclidSteps(1071, 462);
    expect(steps[0]).toEqual({ a: 1071, b: 462, q: 2, r: 147 });
    expect(steps.at(-1)?.b).toBe(21);
    const { g, s, t } = bezout(1071, 462);
    expect(g).toBe(21);
    expect(1071 * s + 462 * t).toBe(21);
  });

  it("lists divisors and common divisors", () => {
    expect(divisorsOf(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(commonDivisors([12, 18])).toEqual([1, 2, 3, 6]);
  });

  it("tiles the rectangle with squares ending at the GCF", () => {
    const { squares, truncated } = euclidTiling(18, 12);
    expect(truncated).toBe(false);
    expect(squares.map((s) => s.size)).toEqual([12, 6, 6]);
    expect(squares.reduce((s, q) => s + q.size * q.size, 0)).toBe(18 * 12);
    expect(euclidTiling(500, 1, 10).truncated).toBe(true);
  });

  it("runs the ladder method", () => {
    const { steps, bottom } = ladderSteps([12, 18]);
    expect(steps.map((s) => s.prime)).toEqual([2, 3]);
    expect(bottom).toEqual([2, 3]);
  });

  it("lists multiples and classifies relations", () => {
    expect(multiplesOf(4, 3)).toEqual([4, 8, 12]);
    expect(relationKind([9, 14])).toBe("coprime");
    expect(relationKind([8, 32])).toBe("divides");
    expect(relationKind([12, 18])).toBe("shared");
    expect(relationKind([5, 5])).toBe("equal");
  });
});
