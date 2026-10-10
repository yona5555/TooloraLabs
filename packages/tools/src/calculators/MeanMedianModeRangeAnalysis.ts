import { computeQuartiles } from "./StatisticsHistogram";

/**
 * Deeper, pure-math breakdown of one data set for the Mean/Median/Mode/Range tool's live
 * table, 3D drawing and indicators. Every figure is derived from the same values the tool's
 * calculator uses, so the visuals can never disagree with the result.
 */

export type MmmFrequency = { value: number; count: number };
export type MmmDeviation = { value: number; deviation: number };
export type MmmCentre = { mean: number; median: number };

export type MmmAnalysis = {
  n: number;
  sorted: number[];
  sum: number;
  mean: number;
  median: number;
  /** 1-based position(s) of the middle value(s) in the sorted list: [k] for odd n, [k, k+1] for even n. */
  medianPositions: number[];
  /** (n + 1) / 2 — the textbook median position. */
  medianRank: number;
  frequencies: MmmFrequency[];
  maxFrequency: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  midrange: number;
  q1: number;
  q3: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
  deviations: MmmDeviation[];
  /** Σ(x − x̄); zero up to floating-point noise. */
  sumDeviations: number;
  sumAbsDevMean: number;
  sumAbsDevMedian: number;
  meanAbsDeviation: number;
  sumSquares: number;
  populationStdDev: number;
  sampleStdDev: number;
  /** Pearson's second skewness coefficient 3(x̄ − median) / s; 0 when s = 0. */
  pearsonSkew: number;
  /** Mean and median after dropping the smallest / largest value (equal to the full set when n = 1). */
  dropMin: MmmCentre;
  dropMax: MmmCentre;
};

function clean(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : Number(v.toPrecision(12));
}

function medianOfSorted(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function centreOf(sorted: number[]): MmmCentre {
  if (sorted.length === 0) return { mean: 0, median: 0 };
  const sum = sorted.reduce((s, v) => s + v, 0);
  return { mean: clean(sum / sorted.length), median: clean(medianOfSorted(sorted)) };
}

/** Distinct values with how often each occurs, ascending by value. */
export function frequencyTable(values: number[]): MmmFrequency[] {
  const map = new Map<number, number>();
  for (const v of values) if (Number.isFinite(v)) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => a.value - b.value);
}

/** Full breakdown of a data set; returns null for an empty set. */
export function analyzeDataSet(values: number[]): MmmAnalysis | null {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return null;

  const sum = sorted.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const median = medianOfSorted(sorted);
  const mid = Math.floor(n / 2);
  const medianPositions = n % 2 === 0 ? [mid, mid + 1] : [mid + 1];

  const frequencies = frequencyTable(sorted);
  const maxFrequency = Math.max(...frequencies.map((f) => f.count));
  const modes = maxFrequency > 1 ? frequencies.filter((f) => f.count === maxFrequency).map((f) => f.value) : [];

  const min = sorted[0];
  const max = sorted[n - 1];
  const { q1, q3, iqr } = computeQuartiles(sorted);
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const deviations = sorted.map((value) => ({ value, deviation: clean(value - mean) }));
  const sumDeviations = clean(sorted.reduce((s, v) => s + (v - mean), 0));
  const sumAbsDevMean = sorted.reduce((s, v) => s + Math.abs(v - mean), 0);
  const sumAbsDevMedian = sorted.reduce((s, v) => s + Math.abs(v - median), 0);
  const sumSquares = sorted.reduce((s, v) => s + (v - mean) ** 2, 0);
  const populationStdDev = Math.sqrt(sumSquares / n);
  const sampleStdDev = n > 1 ? Math.sqrt(sumSquares / (n - 1)) : 0;
  const pearsonSkew = sampleStdDev > 0 ? (3 * (mean - median)) / sampleStdDev : 0;

  return {
    n,
    sorted,
    sum: clean(sum),
    mean: clean(mean),
    median: clean(median),
    medianPositions,
    medianRank: (n + 1) / 2,
    frequencies,
    maxFrequency,
    modes,
    min,
    max,
    range: clean(max - min),
    midrange: clean((min + max) / 2),
    q1,
    q3,
    iqr,
    lowerFence: clean(lowerFence),
    upperFence: clean(upperFence),
    outliers: sorted.filter((v) => v < lowerFence - 1e-12 || v > upperFence + 1e-12),
    deviations,
    sumDeviations,
    sumAbsDevMean: clean(sumAbsDevMean),
    sumAbsDevMedian: clean(sumAbsDevMedian),
    meanAbsDeviation: clean(sumAbsDevMean / n),
    sumSquares: clean(sumSquares),
    populationStdDev: clean(populationStdDev),
    sampleStdDev: clean(sampleStdDev),
    pearsonSkew: clean(pearsonSkew),
    dropMin: n > 1 ? centreOf(sorted.slice(1)) : centreOf(sorted),
    dropMax: n > 1 ? centreOf(sorted.slice(0, -1)) : centreOf(sorted),
  };
}
