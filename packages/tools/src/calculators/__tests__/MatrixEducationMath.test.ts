import { describe, it, expect } from "vitest";
import {
  det2,
  trace2,
  mul2,
  inverse2,
  eigen2,
  charPoly2,
  singularValues2,
  conditionNumber2,
  classifyTransform2,
  lerpFromIdentity2,
  detPowers2,
  detZone,
  columns2,
  frobenius2,
  type Mat2,
} from "../MatrixEducationMath";

const A: Mat2 = [4, 7, 2, 6];

describe("MatrixEducationMath", () => {
  it("computes det, trace, product and inverse", () => {
    expect(det2(A)).toBe(10);
    expect(trace2(A)).toBe(10);
    expect(mul2([1, 2, 3, 4], [5, 6, 7, 8])).toEqual([19, 22, 43, 50]);
    const inv = inverse2(A)!;
    expect(mul2(A, inv).map((v) => Math.round(v * 1e9) / 1e9 + 0)).toEqual([1, 0, 0, 1]);
    expect(inverse2([2, 4, 1, 2])).toBeNull();
  });

  it("finds real and complex eigenvalues that are roots of the characteristic polynomial", () => {
    const e = eigen2(A);
    expect(e.real).toBe(true);
    expect(charPoly2(A, e.l1)).toBeCloseTo(0, 9);
    expect(charPoly2(A, e.l2)).toBeCloseTo(0, 9);
    expect(e.l1 * e.l2).toBeCloseTo(det2(A), 9);
    const rot = eigen2([0, -1, 1, 0]);
    expect(rot.real).toBe(false);
    expect(rot.l1).toBe(0);
    expect(rot.im).toBe(1);
  });

  it("singular values multiply to |det| and give the condition number", () => {
    const [s1, s2] = singularValues2(A);
    expect(s1 * s2).toBeCloseTo(10, 9);
    expect(s1 ** 2 + s2 ** 2).toBeCloseTo(frobenius2(A) ** 2, 9);
    expect(conditionNumber2(A)).toBeCloseTo(s1 / s2, 9);
    expect(conditionNumber2([2, 4, 1, 2])).toBe(Infinity);
    expect(conditionNumber2([1, 0, 0, 1])).toBeCloseTo(1, 9);
  });

  it("classifies common transformations", () => {
    expect(classifyTransform2([1, 0, 0, 1])).toBe("identity");
    expect(classifyTransform2([0, -1, 1, 0])).toBe("rotation");
    expect(classifyTransform2([1, 0, 0, -1])).toBe("reflection");
    expect(classifyTransform2([3, 0, 0, 0.5])).toBe("scaling");
    expect(classifyTransform2([1, 1, 0, 1])).toBe("shear");
    expect(classifyTransform2([2, 4, 1, 2])).toBe("singular");
    expect(classifyTransform2(A)).toBe("general");
  });

  it("interpolates from the identity and tracks det of powers", () => {
    expect(lerpFromIdentity2(A, 0)).toEqual([1, 0, 0, 1]);
    expect(lerpFromIdentity2(A, 1)).toEqual(A);
    expect(detPowers2(A, 3).map((p) => p.det)).toEqual([10, 100, 1000]);
  });

  it("puts determinants in zones and measures columns", () => {
    expect(detZone(-2)).toBe("flip");
    expect(detZone(0)).toBe("collapse");
    expect(detZone(0.5)).toBe("shrink");
    expect(detZone(1)).toBe("preserve");
    expect(detZone(10)).toBe("expand");
    const c = columns2([1, 0, 0, 1]);
    expect(c.angleDeg).toBeCloseTo(90, 9);
    expect(c.len1).toBe(1);
  });
});
