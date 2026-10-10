import { describe, it, expect } from "vitest";
import { drawIntegers, generateRandomNumbers, mulberry32, uniformIndex } from "../RandomNumberGenerator";
import {
  appearanceProbability,
  chiSquareCritical,
  chiSquareUniform,
  drawsForDuplicateChance,
  duplicateProbability,
  entropyZone,
  exactCombination,
  expectedDistinct,
  gammaQ,
  histogram,
  log10OutcomeSpace,
  log10OutcomesFor,
  moduloBias,
  runningMeans,
  sampleStats,
  sciParts,
  sumDistribution,
  uniformMoments,
  upDownCounts,
} from "../RandomNumberMath";

const base = { min: 1, max: 100, count: 5, allowDuplicates: true, sortOrder: "none" as const };

describe("drawIntegers", () => {
  it("is reproducible for a seed and stays inside the range", () => {
    const a = drawIntegers({ ...base, count: 500 }, mulberry32(7));
    const b = drawIntegers({ ...base, count: 500 }, mulberry32(7));
    expect(a.drawn).toEqual(b.drawn);
    expect(a.drawn.every((v) => v >= 1 && v <= 100 && Number.isInteger(v))).toBe(true);
  });

  it("keeps the draw order separate from the sorted display", () => {
    const r = drawIntegers({ ...base, count: 20, sortOrder: "descending" }, mulberry32(3));
    expect(r.numbers).toEqual([...r.drawn].sort((x, y) => y - x));
    expect(r.sum).toBe(r.drawn.reduce((s, v) => s + v, 0));
  });

  it("draws without repeats, even from a huge range", () => {
    const r = drawIntegers({ min: 1, max: 6, count: 6, allowDuplicates: false, sortOrder: "ascending" }, mulberry32(1));
    expect(r.numbers).toEqual([1, 2, 3, 4, 5, 6]);
    const big = drawIntegers({ min: 0, max: 1e12, count: 50, allowDuplicates: false, sortOrder: "none" }, mulberry32(9));
    expect(new Set(big.drawn).size).toBe(50);
  });

  it("reports errors and accepts reversed bounds", () => {
    expect(drawIntegers({ ...base, min: 1.5 }, mulberry32(1)).error).toBe("invalid-range");
    expect(drawIntegers({ ...base, count: 0 }, mulberry32(1)).error).toBe("invalid-count");
    expect(drawIntegers({ ...base, max: 3, allowDuplicates: false }, mulberry32(1)).error).toBe("range-too-small");
    const r = drawIntegers({ ...base, min: 10, max: 5 }, mulberry32(1));
    expect([r.lo, r.hi]).toEqual([5, 10]);
    expect(generateRandomNumbers(base, () => 0).drawn).toEqual([1, 1, 1, 1, 1]);
  });

  it("rejection sampling is exactly uniform over a small source", () => {
    // A fake 32-bit source cycling the top of the space: values ≥ limit must be skipped.
    const seq = [2 ** 32 - 1, 4, 2 ** 32 - 2, 5];
    let i = 0;
    const next = () => seq[i++ % seq.length];
    expect(uniformIndex(3, next)).toBe(1);
    expect(uniformIndex(3, next)).toBe(2);
  });
});

describe("RandomNumberMath", () => {
  it("bins a range and counts every value once", () => {
    const bins = histogram([1, 2, 10, 55, 100, 100], 1, 100);
    expect(bins).toHaveLength(10);
    expect(bins[0]).toMatchObject({ from: 1, to: 10, count: 3, expected: 0.6 });
    expect(bins[9]).toMatchObject({ from: 91, to: 100, count: 2 });
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(6);
    expect(histogram([1, 6], 1, 6)).toHaveLength(6);
  });

  it("computes the chi-square tail", () => {
    expect(gammaQ(1, 2)).toBeCloseTo(Math.exp(-2), 10);
    // χ² = 3.84 with 1 df is the classic 5% cut-off.
    expect(gammaQ(0.5, 3.841459 / 2)).toBeCloseTo(0.05, 5);
    const r = chiSquareUniform([
      { from: 1, to: 1, count: 10, expected: 5 },
      { from: 2, to: 2, count: 0, expected: 5 },
    ]);
    expect(r.stat).toBe(10);
    expect(r.df).toBe(1);
    expect(r.pValue).toBeCloseTo(0.001565, 5);
    expect(chiSquareCritical(1, 0.05)).toBeCloseTo(3.841459, 4);
    expect(chiSquareCritical(9, 0.05)).toBeCloseTo(16.918978, 4);
  });

  it("gives the spread of the sum with and without replacement", () => {
    const w = sumDistribution(1, 6, 10, true);
    expect(w.expected).toBe(35);
    expect(w.sd).toBeCloseTo(Math.sqrt((35 / 12) * 10), 10);
    expect(sumDistribution(1, 6, 6, false).sd).toBeCloseTo(0, 10);
  });

  it("describes a sample and the uniform distribution", () => {
    expect(sampleStats([2, 4, 4, 4, 5, 5, 7, 9])).toMatchObject({ mean: 5, median: 4.5, min: 2, max: 9, distinct: 5 });
    expect(sampleStats([2, 4, 4, 4, 5, 5, 7, 9]).sd).toBeCloseTo(2.13809, 4);
    expect(uniformMoments(1, 6)).toMatchObject({ mean: 3.5 });
    expect(uniformMoments(1, 6).variance).toBeCloseTo(35 / 12, 12);
    expect(runningMeans([2, 4, 6])).toEqual([
      { index: 1, mean: 2 },
      { index: 2, mean: 3 },
      { index: 3, mean: 4 },
    ]);
    expect(upDownCounts([3, 5, 5, 1, 2])).toEqual({ ups: 2, downs: 1, ties: 1 });
    expect(runningMeans(Array.from({ length: 1000 }, () => 1), 100)).toHaveLength(100);
  });

  it("solves the birthday problem and repeat odds", () => {
    expect(duplicateProbability(365, 23)).toBeCloseTo(0.507297, 5);
    expect(duplicateProbability(365, 30)).toBeCloseTo(0.706316, 5);
    expect(duplicateProbability(6, 7)).toBe(1);
    expect(drawsForDuplicateChance(365, 0.5)).toBe(23);
    expect(expectedDistinct(6, 6)).toBeCloseTo(6 * (1 - (5 / 6) ** 6), 10);
    expect(appearanceProbability(6, 4, true)).toBeCloseTo(1 - (5 / 6) ** 4, 10);
    expect(appearanceProbability(250, 3, false)).toBeCloseTo(0.012, 12);
  });

  it("sizes the outcome space", () => {
    expect(exactCombination(49, 6)).toBe(13983816);
    expect(exactCombination(69, 5)).toBe(11238513);
    expect(exactCombination(1000, 500)).toBeNull();
    const s = log10OutcomeSpace(6, 2);
    expect(10 ** s.orderedWith).toBeCloseTo(36, 8);
    expect(10 ** s.unorderedWith).toBeCloseTo(21, 8);
    expect(10 ** s.orderedWithout).toBeCloseTo(30, 8);
    expect(10 ** s.unorderedWithout).toBeCloseTo(15, 8);
    expect(log10OutcomesFor(3, 5, false, false)).toBe(-Infinity);
    expect(sciParts(Math.log10(13983816))).toMatchObject({ exponent: 7 });
    expect(sciParts(Math.log10(13983816)).mantissa).toBeCloseTo(1.3983816, 6);
    expect(entropyZone(Math.log2(100))).toBe("guessable");
    expect(entropyZone(130)).toBe("cryptographic");
  });

  it("measures naive modulo bias", () => {
    const b = moduloBias(100);
    expect(b).toMatchObject({ sourceBits: 8, sourceSize: 256, heavyValues: 56, heavyProbability: 3 / 256, lightProbability: 2 / 256 });
    expect(b.biasRatio).toBe(1.5);
    expect(b.rejectionRate).toBeCloseTo((2 ** 32 % 100) / 2 ** 32, 15);
    expect(moduloBias(64).heavyValues).toBe(0);
    expect(moduloBias(1000).sourceBits).toBe(16);
  });
});
