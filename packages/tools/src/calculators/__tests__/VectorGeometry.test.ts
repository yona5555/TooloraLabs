import { describe, it, expect } from "vitest";
import { analyzeVectors, angleArcPoints, classifyVectorRelation, dotVsAngleCurve, scaleBSensitivity, vecMag } from "../VectorGeometry";

describe("analyzeVectors", () => {
  const r = analyzeVectors([3, 4, 0], [1, 2, 2]);

  it("matches the core vector operations", () => {
    expect(r.magA).toBe(5);
    expect(r.magB).toBe(3);
    expect(r.dot).toBe(11);
    expect(r.dotTerms).toEqual([3, 8, 0]);
    expect(r.cross).toEqual([8, -6, 2]);
    expect(r.crossMag).toBeCloseTo(Math.sqrt(104), 10);
    expect(r.triangleArea).toBeCloseTo(Math.sqrt(104) / 2, 10);
  });

  it("satisfies Lagrange's identity and the parallelogram law", () => {
    expect(r.dotSquared + r.crossSquared).toBeCloseTo(r.lagrangeTotal, 9);
    expect(r.parallelogramLeft).toBeCloseTo(r.parallelogramRight, 9);
  });

  it("splits A into projection plus a rejection perpendicular to B", () => {
    expect(r.compAonB).toBeCloseTo(11 / 3, 10);
    const rej = r.rejAfromB!;
    expect(rej[0] * 1 + rej[1] * 2 + rej[2] * 2).toBeCloseTo(0, 10);
    // |rejection| is the parallelogram height on base |B|.
    expect(r.rejMag! * r.magB).toBeCloseTo(r.crossMag, 9);
  });

  it("has direction cosines squared that sum to 1", () => {
    const s = r.dirCos2A!;
    expect(s[0] + s[1] + s[2]).toBeCloseTo(1, 12);
    expect(r.dirAnglesA![2]).toBeCloseTo(90, 10);
  });

  it("returns nulls for a zero vector", () => {
    const z = analyzeVectors([0, 0, 0], [1, 0, 0]);
    expect(z.cos).toBeNull();
    expect(z.unitA).toBeNull();
    expect(z.relation).toBe("zero");
    expect(z.projAonB).toEqual([0, 0, 0]);
  });
});

describe("classifyVectorRelation", () => {
  it("names each angle band", () => {
    expect(classifyVectorRelation(1)).toBe("parallel");
    expect(classifyVectorRelation(-1)).toBe("antiparallel");
    expect(classifyVectorRelation(0)).toBe("orthogonal");
    expect(classifyVectorRelation(0.4)).toBe("acute");
    expect(classifyVectorRelation(-0.4)).toBe("obtuse");
  });
});

describe("dotVsAngleCurve", () => {
  it("runs from +|A||B| to −|A||B|", () => {
    const c = dotVsAngleCurve(5, 3, 4);
    expect(c).toHaveLength(5);
    expect(c[0].dot).toBeCloseTo(15, 10);
    expect(c[2].dot).toBeCloseTo(0, 10);
    expect(c[4].dot).toBeCloseTo(-15, 10);
  });
});

describe("angleArcPoints", () => {
  it("sweeps from A's direction to B's at the given radius", () => {
    const pts = angleArcPoints([1, 0, 0], [0, 2, 0], 2, 4);
    expect(pts).toHaveLength(5);
    expect(pts[0][0]).toBeCloseTo(2, 10);
    expect(pts[4][1]).toBeCloseTo(2, 10);
    for (const p of pts) expect(vecMag(p)).toBeCloseTo(2, 10);
  });

  it("is empty for parallel vectors", () => {
    expect(angleArcPoints([1, 0, 0], [3, 0, 0], 1)).toEqual([]);
  });
});

describe("scaleBSensitivity", () => {
  it("scales the dot and cross linearly and keeps the angle", () => {
    const [half, one, two] = scaleBSensitivity([3, 4, 0], [1, 2, 2]);
    expect(half.dot).toBeCloseTo(5.5, 10);
    expect(two.dot).toBeCloseTo(22, 10);
    expect(two.crossMag).toBeCloseTo(2 * one.crossMag, 10);
    expect(half.angleDeg).toBeCloseTo(one.angleDeg!, 10);
  });
});
