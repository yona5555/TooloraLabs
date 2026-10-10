import { describe, expect, it } from "vitest";
import { analyzeSpread, normalCdf, normalPdf, tCritical95 } from "../standardDeviationAnalysis";

describe("analyzeSpread", () => {
  const a = analyzeSpread([2, 4, 4, 4, 5, 5, 7, 9])!;

  it("matches the textbook example (μ = 5, σ = 2)", () => {
    expect(a.n).toBe(8);
    expect(a.mean).toBe(5);
    expect(a.sumSquares).toBe(32);
    expect(a.populationStdDev).toBe(2);
    expect(a.sampleVariance).toBeCloseTo(32 / 7, 12);
    expect(a.sampleStdDev).toBeCloseTo(Math.sqrt(32 / 7), 12);
    expect(a.sumSquaresShortcut).toBeCloseTo(a.sumSquares, 9);
    expect(a.sumDeviations).toBeCloseTo(0, 12);
    expect(a.meanAbsDeviation).toBe(1.5);
  });

  it("computes z-scores, shares and the farthest/closest points", () => {
    expect(a.zMin).toBe(-1.5);
    expect(a.zMax).toBe(2);
    expect(a.points.reduce((s, p) => s + p.shareOfSS, 0)).toBeCloseTo(1, 12);
    expect(a.farthest.value).toBe(9);
    expect([4, 5]).toContain(a.closest.value);
    expect(a.coefficientOfVariation).toBe(40);
  });

  it("counts values inside the 1σ/2σ/3σ bands", () => {
    expect(a.bands.map((b) => b.inside)).toEqual([6, 8, 8]);
    expect(a.bands[0].lo).toBe(3);
    expect(a.bands[1].chebyshevShare).toBe(0.75);
  });

  it("standard error and the 95 % t interval", () => {
    expect(a.standardError).toBeCloseTo(a.sampleStdDev / Math.sqrt(8), 12);
    expect(a.tCritical).toBe(2.365);
    expect(a.ciHigh - a.mean).toBeCloseTo(2.365 * a.standardError, 12);
  });

  it("running σ (Welford) ends at the full-set value; leave-one-out drops σ when the outlier goes", () => {
    expect(a.running).toHaveLength(8);
    expect(a.running[7].populationStdDev).toBeCloseTo(2, 12);
    expect(a.running[0].sampleStdDev).toBe(0);
    const withoutNine = a.leaveOneOut.find((l) => l.value === 9)!;
    expect(withoutNine.populationStdDev).toBeLessThan(2);
  });

  it("handles a single value and an empty set", () => {
    const one = analyzeSpread([7])!;
    expect(one.populationStdDev).toBe(0);
    expect(one.sampleStdDev).toBe(0);
    expect(one.standardError).toBe(0);
    expect(one.besselFactor).toBe(1);
    expect(one.bands[0].inside).toBe(1);
    expect(analyzeSpread([])).toBeNull();
  });

  it("CV is null for a zero mean", () => {
    expect(analyzeSpread([-1, 1])!.coefficientOfVariation).toBeNull();
  });
});

describe("normal helpers", () => {
  it("Φ and φ", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 7);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normalCdf(-1)).toBeCloseTo(0.158655, 5);
    expect(normalPdf(0)).toBeCloseTo(0.398942, 6);
  });

  it("t critical values", () => {
    expect(tCritical95(0)).toBe(0);
    expect(tCritical95(1)).toBe(12.706);
    expect(tCritical95(50)).toBeCloseTo(2.0105, 4);
    expect(tCritical95(500)).toBe(1.96);
  });
});
