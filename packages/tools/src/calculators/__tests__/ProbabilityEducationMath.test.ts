import { describe, it, expect } from "vitest";
import {
  atLeastOnce,
  binomialCoefficient,
  binomialDistribution,
  circleDistanceForOverlap,
  circleOverlapArea,
  clampJoint,
  deriveJoint,
  oddsFromProbability,
  regionCounts,
  sampleRegions,
  seededUnitRandom,
  simulateBernoulli,
  surprisalBits,
  trialsForConfidence,
} from "../ProbabilityEducationMath";

describe("ProbabilityEducationMath", () => {
  it("derives every region of a king-or-heart joint model", () => {
    const b = deriveJoint({ pA: 4 / 52, pB: 13 / 52, pAB: 1 / 52 });
    expect(b.union).toBeCloseTo(16 / 52, 12);
    expect(b.aOnly + b.bOnly + b.pAB + b.neither).toBeCloseTo(1, 12);
    expect(b.aGivenB).toBeCloseTo(1 / 13, 12);
    expect(b.bGivenA).toBeCloseTo(1 / 4, 12);
    expect(b.lift).toBeCloseTo(1, 12);
    expect(b.relation).toBe("independent");
  });

  it("classifies exclusive, positive and negative dependence", () => {
    expect(deriveJoint({ pA: 0.3, pB: 0.4, pAB: 0 }).relation).toBe("exclusive");
    expect(deriveJoint({ pA: 0.5, pB: 0.5, pAB: 0.4 }).relation).toBe("positive");
    expect(deriveJoint({ pA: 0.5, pB: 0.5, pAB: 0.1 }).relation).toBe("negative");
  });

  it("clamps an infeasible intersection into its bounds", () => {
    expect(clampJoint({ pA: 0.2, pB: 0.3, pAB: 0.5 }).pAB).toBeCloseTo(0.2, 12);
    expect(clampJoint({ pA: 0.8, pB: 0.7, pAB: 0 }).pAB).toBeCloseTo(0.5, 12);
  });

  it("computes odds, at-least-once and trials for confidence", () => {
    expect(oddsFromProbability(1 / 6).oddsAgainst).toBeCloseTo(5, 12);
    expect(oddsFromProbability(1).oddsFor).toBe(Infinity);
    expect(atLeastOnce(0.5, 2)).toBeCloseTo(0.75, 12);
    expect(trialsForConfidence(1 / 6, 0.5)).toBe(4);
    expect(trialsForConfidence(0.5, 0.75)).toBe(2);
    expect(trialsForConfidence(0, 0.5)).toBe(Infinity);
  });

  it("builds a binomial distribution that sums to one", () => {
    expect(binomialCoefficient(10, 3)).toBe(120);
    const d = binomialDistribution(10, 0.3);
    expect(d).toHaveLength(11);
    expect(d.reduce((a, v) => a + v, 0)).toBeCloseTo(1, 12);
    expect(surprisalBits(0.25)).toBeCloseTo(2, 12);
  });

  it("splits 100 cubes across regions with the largest remainder", () => {
    const c = regionCounts({ pA: 1 / 3, pB: 1 / 3, pAB: 1 / 9 });
    expect(c.reduce((a, v) => a + v, 0)).toBe(100);
    expect(c).toEqual([11, 22, 22, 45]);
  });

  it("finds the centre distance giving a target circle overlap", () => {
    const d = circleDistanceForOverlap(1, 1.2, 0.8);
    expect(circleOverlapArea(1, 1.2, d)).toBeCloseTo(0.8, 6);
    expect(circleDistanceForOverlap(1, 1, 0)).toBe(2);
  });

  it("draws regions whose frequencies approach the joint model, reproducibly", () => {
    const j = { pA: 0.3, pB: 0.4, pAB: 0.1 };
    const a = sampleRegions(j, 20000, 11);
    expect(a).toEqual(sampleRegions(j, 20000, 11));
    const freq = [0, 1, 2, 3].map((r) => a.filter((x) => x === r).length / a.length);
    expect(freq[0]).toBeCloseTo(0.1, 1);
    expect(freq[1]).toBeCloseTo(0.2, 1);
    expect(freq[2]).toBeCloseTo(0.3, 1);
    expect(freq[3]).toBeCloseTo(0.4, 1);
  });

  it("simulates reproducibly with a seeded generator and converges", () => {
    const a = simulateBernoulli(0.3, 5000, 42);
    const b = simulateBernoulli(0.3, 5000, 42);
    expect(a.running).toEqual(b.running);
    expect(a.running[a.running.length - 1]).toBeCloseTo(0.3, 1);
    const r = seededUnitRandom(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
