import { describe, expect, it } from "vitest";
import { solveSSS } from "../TriangleCalculator";
import { isDegenerateTriangle, projectOntoActiveAngleBase, triangleAreaFromVertices } from "../TriangleActiveAngleGeometry";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

describe("projectOntoActiveAngleBase", () => {
  it("matches the mandated 3-4-5 case: b*sinA=2.4, b*cosA=3.2, area=6", () => {
    const result = solveSSS(3, 4, 5);
    expect(result.valid).toBe(true);
    if (!result.valid) return;

    const [A, B, C] = result.vertices; // a=BC=3, b=CA=4, c=AB=5
    const projection = projectOntoActiveAngleBase(A, B, C);

    expect(round2(projection.heightLength)).toBe(2.4); // b*sinA
    expect(round2(projection.signedAdjacent)).toBe(3.2); // b*cosA
    expect(projection.isObtuse).toBe(false);
    expect(round2(triangleAreaFromVertices(A, B, C))).toBe(6);
  });

  it("yields a negative signedAdjacent (cosine) for an obtuse active angle", () => {
    // a=7 (opposite A) is the longest side, so angle A is obtuse.
    const result = solveSSS(7, 4, 5);
    expect(result.valid).toBe(true);
    if (!result.valid) return;

    const [A, B, C] = result.vertices;
    const projection = projectOntoActiveAngleBase(A, B, C);

    expect(projection.angleDeg).toBeGreaterThan(90);
    expect(projection.signedAdjacent).toBeLessThan(0);
    expect(projection.isObtuse).toBe(true);
    // Height stays positive regardless of the obtuse extension.
    expect(projection.heightLength).toBeGreaterThan(0);
  });

  it("is symmetric under an arbitrary rigid transform (not axis-aligned)", () => {
    const result = solveSSS(3, 4, 5);
    expect(result.valid).toBe(true);
    if (!result.valid) return;

    const [A, B, C] = result.vertices;
    const shift = (p: { x: number; y: number }) => ({ x: p.x * 2 - p.y + 5, y: p.x + p.y * 2 - 3 });
    const A2 = shift(A);
    const B2 = shift(B);
    const C2 = shift(C);

    const original = projectOntoActiveAngleBase(A, B, C);
    const transformed = projectOntoActiveAngleBase(A2, B2, C2);

    expect(round2(transformed.angleDeg)).toBe(round2(original.angleDeg));
  });
});

describe("isDegenerateTriangle", () => {
  it("is false for a healthy triangle", () => {
    const result = solveSSS(3, 4, 5);
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    const [A, B, C] = result.vertices;
    expect(isDegenerateTriangle(A, B, C)).toBe(false);
  });

  it("is true when two vertices nearly coincide", () => {
    const A = { x: 0, y: 0 };
    const B = { x: 0.05, y: 0.05 };
    const C = { x: 5, y: 5 };
    expect(isDegenerateTriangle(A, B, C)).toBe(true);
  });

  it("is true for a near-zero interior angle", () => {
    const A = { x: 0, y: 0 };
    const B = { x: 10, y: 0 };
    const C = { x: 10.1, y: 0.05 };
    expect(isDegenerateTriangle(A, B, C)).toBe(true);
  });
});
