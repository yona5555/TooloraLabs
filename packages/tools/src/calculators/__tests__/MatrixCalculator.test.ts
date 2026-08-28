import { describe, it, expect } from "vitest";
import { MatrixCalculator } from "../MatrixCalculator";

const context = { locale: "en-US" };
const calc = new MatrixCalculator();

describe("MatrixCalculator", () => {
  it("computes the sum and difference element-wise", () => {
    const r = calc.execute({ a11: 1, a12: 2, a21: 3, a22: 4, b11: 5, b12: 6, b21: 7, b22: 8 }, context);
    expect(r.data.sum11).toBe(6);
    expect(r.data.sum12).toBe(8);
    expect(r.data.sum21).toBe(10);
    expect(r.data.sum22).toBe(12);
    expect(r.data.diff11).toBe(-4);
    expect(r.data.diff12).toBe(-4);
    expect(r.data.diff21).toBe(-4);
    expect(r.data.diff22).toBe(-4);
  });

  it("computes the matrix product A x B", () => {
    const r = calc.execute({ a11: 1, a12: 2, a21: 3, a22: 4, b11: 5, b12: 6, b21: 7, b22: 8 }, context);
    // [1 2; 3 4] x [5 6; 7 8] = [1*5+2*7, 1*6+2*8; 3*5+4*7, 3*6+4*8] = [19, 22; 43, 50]
    expect(r.data.product11).toBe(19);
    expect(r.data.product12).toBe(22);
    expect(r.data.product21).toBe(43);
    expect(r.data.product22).toBe(50);
  });

  it("computes determinants for both matrices", () => {
    const r = calc.execute({ a11: 1, a12: 2, a21: 3, a22: 4, b11: 2, b12: 0, b21: 0, b22: 2 }, context);
    expect(r.data.determinantA).toBe(1 * 4 - 2 * 3);
    expect(r.data.determinantB).toBe(4);
  });

  it("computes the transpose of A", () => {
    const r = calc.execute({ a11: 1, a12: 2, a21: 3, a22: 4, b11: 0, b12: 0, b21: 0, b22: 0 }, context);
    expect(r.data.transposeA11).toBe(1);
    expect(r.data.transposeA12).toBe(3);
    expect(r.data.transposeA21).toBe(2);
    expect(r.data.transposeA22).toBe(4);
  });

  it("computes the inverse of a well-conditioned matrix A", () => {
    const r = calc.execute({ a11: 4, a12: 7, a21: 2, a22: 6, b11: 0, b12: 0, b21: 0, b22: 0 }, context);
    // det = 4*6 - 7*2 = 10
    expect(r.data.determinantA).toBe(10);
    expect(r.data.inverseA11).toBe(0.6);
    expect(r.data.inverseA12).toBeCloseTo(-0.7, 10);
    expect(r.data.inverseA21).toBeCloseTo(-0.2, 10);
    expect(r.data.inverseA22).toBe(0.4);
  });

  it("verifies A times its inverse gives the identity matrix", () => {
    const r = calc.execute({ a11: 4, a12: 7, a21: 2, a22: 6, b11: 0, b12: 0, b21: 0, b22: 0 }, context);
    const inv = new MatrixCalculator();
    const identity = inv.execute(
      { a11: 4, a12: 7, a21: 2, a22: 6, b11: r.data.inverseA11!, b12: r.data.inverseA12!, b21: r.data.inverseA21!, b22: r.data.inverseA22! },
      context
    );
    expect(identity.data.product11).toBeCloseTo(1, 9);
    expect(identity.data.product12).toBeCloseTo(0, 9);
    expect(identity.data.product21).toBeCloseTo(0, 9);
    expect(identity.data.product22).toBeCloseTo(1, 9);
  });

  it("flags a singular matrix A (zero determinant) and returns null inverse", () => {
    const r = calc.execute({ a11: 2, a12: 4, a21: 1, a22: 2, b11: 0, b12: 0, b21: 0, b22: 0 }, context);
    expect(r.data.determinantA).toBe(0);
    expect(r.data.error).toBe("singular-matrix-a");
    expect(r.data.inverseA11).toBeNull();
    expect(r.data.inverseA12).toBeNull();
    expect(r.data.inverseA21).toBeNull();
    expect(r.data.inverseA22).toBeNull();
  });

  it("still computes sum, difference, and product even when A is singular", () => {
    const r = calc.execute({ a11: 2, a12: 4, a21: 1, a22: 2, b11: 1, b12: 0, b21: 0, b22: 1 }, context);
    expect(r.data.error).toBe("singular-matrix-a");
    expect(r.data.sum11).toBe(3);
    expect(r.data.product11).toBe(2);
  });
});
