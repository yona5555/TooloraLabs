/**
 * Deeper, pure analysis of a data set's spread for the Standard Deviation Calculator's live
 * table, 3D drawing and indicators. Everything is derived from the same numbers the calculator
 * returns (mean, sum of squares, σ, s), so no visual can disagree with the result. No DOM.
 */

export type SpreadPoint = {
  /** Position in the input order (0-based). */
  index: number;
  value: number;
  deviation: number;
  squaredDeviation: number;
  /** Share of the sum of squares this value contributes (0…1). */
  shareOfSS: number;
  /** z-score against the population standard deviation (0 when σ = 0). */
  z: number;
};

export type SigmaBand = {
  k: 1 | 2 | 3;
  lo: number;
  hi: number;
  /** How many values fall inside [μ − kσ, μ + kσ]. */
  inside: number;
  /** inside / n */
  actualShare: number;
  /** Normal-distribution share: 68.27 %, 95.45 %, 99.73 %. */
  normalShare: number;
  /** Chebyshev's guaranteed minimum share for any distribution: 1 − 1/k² (0 for k = 1). */
  chebyshevShare: number;
};

export type LeaveOneOut = { index: number; value: number; populationStdDev: number };

export type SpreadAnalysis = {
  n: number;
  sum: number;
  sumOfSquaresRaw: number;
  mean: number;
  min: number;
  max: number;
  range: number;
  sorted: number[];
  points: SpreadPoint[];
  sumDeviations: number;
  sumAbsDeviations: number;
  meanAbsDeviation: number;
  sumSquares: number;
  /** Shortcut form Σx² − (Σx)² / n; equals sumSquares up to rounding. */
  sumSquaresShortcut: number;
  populationVariance: number;
  populationStdDev: number;
  sampleVariance: number;
  sampleStdDev: number;
  /** s / σ = √(n / (n − 1)); 1 when n = 1. */
  besselFactor: number;
  /** s / √n (0 when n = 1). */
  standardError: number;
  /** Two-sided 95 % Student t critical value for n − 1 degrees of freedom (0 when n = 1). */
  tCritical: number;
  ciLow: number;
  ciHigh: number;
  /** σ / |μ| × 100, null when the mean is 0. */
  coefficientOfVariation: number | null;
  zMin: number;
  zMax: number;
  /** Point farthest from the mean (largest squared deviation). */
  farthest: SpreadPoint;
  /** Point closest to the mean. */
  closest: SpreadPoint;
  bands: SigmaBand[];
  /** Running population and sample σ after each value in input order (Welford). */
  running: { n: number; populationStdDev: number; sampleStdDev: number }[];
  leaveOneOut: LeaveOneOut[];
};

const T95: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145, 15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.08, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
  40: 2.021, 60: 2.0, 120: 1.98,
};

/** Two-sided 95 % t critical value (table, linear between 30/40/60/120, 1.96 beyond). */
export function tCritical95(df: number): number {
  if (df < 1) return 0;
  if (T95[df] !== undefined) return T95[df];
  const anchors = [30, 40, 60, 120];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (df > a && df < b) return T95[a] + ((df - a) / (b - a)) * (T95[b] - T95[a]);
  }
  return 1.96;
}

/** Standard normal density φ(z). */
export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** Standard normal cumulative Φ(z) (Abramowitz–Stegun 7.1.26 erf, error < 1.5e-7). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

const NORMAL_SHARE: Record<1 | 2 | 3, number> = { 1: 0.6827, 2: 0.9545, 3: 0.9973 };

function popSd(values: number[]): number {
  if (!values.length) return 0;
  const m = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

/** Full spread analysis; null for an empty data set. */
export function analyzeSpread(values: number[]): SpreadAnalysis | null {
  const n = values.length;
  if (n === 0) return null;
  const sum = values.reduce((s, v) => s + v, 0);
  const sumOfSquaresRaw = values.reduce((s, v) => s + v * v, 0);
  const mean = sum / n;
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];

  const devs = values.map((v) => v - mean);
  const sumSquares = devs.reduce((s, d) => s + d * d, 0);
  const populationVariance = sumSquares / n;
  const populationStdDev = Math.sqrt(populationVariance);
  const sampleVariance = n > 1 ? sumSquares / (n - 1) : 0;
  const sampleStdDev = Math.sqrt(sampleVariance);

  const points: SpreadPoint[] = values.map((value, index) => {
    const deviation = devs[index];
    const sq = deviation * deviation;
    return {
      index,
      value,
      deviation,
      squaredDeviation: sq,
      shareOfSS: sumSquares > 0 ? sq / sumSquares : 0,
      z: populationStdDev > 0 ? deviation / populationStdDev : 0,
    };
  });

  const byDistance = [...points].sort((a, b) => a.squaredDeviation - b.squaredDeviation);
  const standardError = n > 1 ? sampleStdDev / Math.sqrt(n) : 0;
  const tCritical = tCritical95(n - 1);

  const bands: SigmaBand[] = ([1, 2, 3] as const).map((k) => {
    const lo = mean - k * populationStdDev;
    const hi = mean + k * populationStdDev;
    const eps = 1e-9 * Math.max(1, Math.abs(mean), populationStdDev);
    const inside = values.filter((v) => v >= lo - eps && v <= hi + eps).length;
    return { k, lo, hi, inside, actualShare: inside / n, normalShare: NORMAL_SHARE[k], chebyshevShare: 1 - 1 / (k * k) };
  });

  // Welford's online algorithm: σ after each value, in input order.
  const running: SpreadAnalysis["running"] = [];
  let m = 0;
  let m2 = 0;
  values.forEach((v, i) => {
    const count = i + 1;
    const delta = v - m;
    m += delta / count;
    m2 += delta * (v - m);
    running.push({
      n: count,
      populationStdDev: Math.sqrt(Math.max(0, m2) / count),
      sampleStdDev: count > 1 ? Math.sqrt(Math.max(0, m2) / (count - 1)) : 0,
    });
  });

  const leaveOneOut: LeaveOneOut[] = values.map((value, index) => ({
    index,
    value,
    populationStdDev: popSd(values.filter((_, j) => j !== index)),
  }));

  return {
    n,
    sum,
    sumOfSquaresRaw,
    mean,
    min,
    max,
    range: max - min,
    sorted,
    points,
    sumDeviations: devs.reduce((s, d) => s + d, 0),
    sumAbsDeviations: devs.reduce((s, d) => s + Math.abs(d), 0),
    meanAbsDeviation: devs.reduce((s, d) => s + Math.abs(d), 0) / n,
    sumSquares,
    sumSquaresShortcut: sumOfSquaresRaw - (sum * sum) / n,
    populationVariance,
    populationStdDev,
    sampleVariance,
    sampleStdDev,
    besselFactor: n > 1 ? Math.sqrt(n / (n - 1)) : 1,
    standardError,
    tCritical,
    ciLow: mean - tCritical * standardError,
    ciHigh: mean + tCritical * standardError,
    coefficientOfVariation: mean !== 0 ? (populationStdDev / Math.abs(mean)) * 100 : null,
    zMin: populationStdDev > 0 ? (min - mean) / populationStdDev : 0,
    zMax: populationStdDev > 0 ? (max - mean) / populationStdDev : 0,
    farthest: byDistance[n - 1],
    closest: byDistance[0],
    bands,
    running,
    leaveOneOut,
  };
}
