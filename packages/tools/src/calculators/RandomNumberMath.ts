/**
 * Pure statistics behind the Random Number Generator's indicators: how a draw spreads over its
 * range, how far it is from uniform, the odds of repeats, the size of the outcome space, and the
 * bias a naive modulo would add. No DOM — shared by the web page and any future app.
 */

export type HistogramBin = { from: number; to: number; count: number; expected: number };

/** Number of integers in [lo, hi]. */
export function rangeSize(lo: number, hi: number): number {
  return Math.abs(hi - lo) + 1;
}

/**
 * Groups values into at most `maxBins` integer bins of near-equal width covering [lo, hi]. When the
 * range has `maxBins` integers or fewer, every integer gets its own bin. `expected` is the uniform
 * expectation for that bin: total × width ÷ range size.
 */
export function histogram(values: number[], lo: number, hi: number, maxBins = 10): HistogramBin[] {
  const n = rangeSize(lo, hi);
  const b = Math.max(1, Math.min(maxBins, n));
  const bins: HistogramBin[] = [];
  for (let i = 0; i < b; i++) {
    const from = lo + Math.floor((i * n) / b);
    const to = lo + Math.floor(((i + 1) * n) / b) - 1;
    bins.push({ from, to, count: 0, expected: (values.length * (to - from + 1)) / n });
  }
  for (const v of values) {
    const i = Math.min(b - 1, Math.floor(((v - lo) * b) / n));
    // Integer bin edges can round; nudge to the bin that really contains v.
    let j = i;
    while (j > 0 && v < bins[j].from) j--;
    while (j < b - 1 && v > bins[j].to) j++;
    bins[j].count++;
  }
  return bins;
}

/** ln Γ(x) for x > 0 (Lanczos, g = 7). */
export function logGamma(x: number): number {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const z = x - 1;
  let a = c[0];
  const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (z + i);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Regularized upper incomplete gamma Q(a, x) — the chi-square tail is Q(df/2, χ²/2). */
export function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  const lnPre = -x + a * Math.log(x) - logGamma(a);
  if (x < a + 1) {
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 1000; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return Math.max(0, Math.min(1, 1 - sum * Math.exp(lnPre)));
  }
  // Lentz continued fraction.
  let b = x + 1 - a;
  let c = 1 / 1e-300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.max(0, Math.min(1, Math.exp(lnPre) * h));
}

export type ChiSquareResult = { stat: number; df: number; pValue: number; minExpected: number };

/** Pearson's goodness-of-fit against a uniform spread: χ² = Σ (O − E)² ÷ E over the bins. */
export function chiSquareUniform(bins: HistogramBin[]): ChiSquareResult {
  const df = Math.max(1, bins.length - 1);
  let stat = 0;
  let minExpected = Infinity;
  for (const b of bins) {
    if (b.expected > 0) stat += (b.count - b.expected) ** 2 / b.expected;
    minExpected = Math.min(minExpected, b.expected);
  }
  return { stat, df, pValue: bins.length < 2 ? 1 : gammaQ(df / 2, stat / 2), minExpected: Number.isFinite(minExpected) ? minExpected : 0 };
}

export type SampleStats = { count: number; mean: number; median: number; sd: number; min: number; max: number; distinct: number };

/** Mean, median, sample standard deviation (n − 1), extremes and distinct-value count. */
export function sampleStats(values: number[]): SampleStats {
  const count = values.length;
  if (count === 0) return { count: 0, mean: 0, median: 0, sd: 0, min: 0, max: 0, distinct: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / count;
  const mid = Math.floor(count / 2);
  const median = count % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const sd = count > 1 ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (count - 1)) : 0;
  return { count, mean, median, sd, min: sorted[0], max: sorted[count - 1], distinct: new Set(values).size };
}

/** Mean and spread of the discrete uniform distribution on [lo, hi]: μ = (lo + hi) ÷ 2, σ² = (N² − 1) ÷ 12. */
export function uniformMoments(lo: number, hi: number): { mean: number; variance: number; sd: number } {
  const n = rangeSize(lo, hi);
  const variance = (n * n - 1) / 12;
  return { mean: (lo + hi) / 2, variance, sd: Math.sqrt(variance) };
}

/** Running mean after each draw, thinned to at most `maxPoints` points (the last draw is always kept). */
export function runningMeans(drawn: number[], maxPoints = 200): { index: number; mean: number }[] {
  const out: { index: number; mean: number }[] = [];
  const step = Math.max(1, Math.ceil(drawn.length / maxPoints));
  let sum = 0;
  drawn.forEach((v, i) => {
    sum += v;
    if ((i + 1) % step === 0 || i === drawn.length - 1) out.push({ index: i + 1, mean: sum / (i + 1) });
  });
  return out;
}

/** P(at least one repeated value) in k independent draws from N values — the birthday problem. */
export function duplicateProbability(n: number, k: number): number {
  if (k <= 1 || n <= 0) return 0;
  if (k > n) return 1;
  let logNoRepeat = 0;
  for (let i = 1; i < k; i++) logNoRepeat += Math.log1p(-i / n);
  return -Math.expm1(logNoRepeat);
}

/** Smallest k with P(repeat) ≥ p (e.g. p = 0.5 gives 23 for N = 365). */
export function drawsForDuplicateChance(n: number, p: number): number {
  let logNoRepeat = 0;
  for (let k = 2; k <= n + 1; k++) {
    logNoRepeat += Math.log1p(-(k - 1) / n);
    if (-Math.expm1(logNoRepeat) >= p) return k;
    if (k > 1e6) break;
  }
  return n + 1;
}

/** Expected number of distinct values in k draws with replacement: N · (1 − (1 − 1/N)^k). */
export function expectedDistinct(n: number, k: number): number {
  if (n <= 1) return Math.min(k, n);
  return -n * Math.expm1(k * Math.log1p(-1 / n));
}

/** P(one chosen value appears at least once): 1 − (1 − 1/N)^k with replacement, k ÷ N without. */
export function appearanceProbability(n: number, k: number, withReplacement: boolean): number {
  if (n <= 0) return 0;
  if (!withReplacement) return Math.min(1, k / n);
  return -Math.expm1(k * Math.log1p(-1 / n));
}

/** log10 of n! via ln Γ(n + 1). */
export function log10Factorial(n: number): number {
  return n < 2 ? 0 : logGamma(n + 1) / Math.LN10;
}

/** log10 of C(n, k). */
export function log10Combination(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return log10Factorial(n) - log10Factorial(k) - log10Factorial(n - k);
}

/** C(n, k) exactly when it fits in a safe integer, otherwise null. */
export function exactCombination(n: number, k: number): number | null {
  if (k < 0 || k > n) return 0;
  const r = Math.min(k, n - k);
  if (log10Combination(n, k) > 15.9) return null;
  let v = 1;
  for (let i = 1; i <= r; i++) v = (v * (n - r + i)) / i;
  const rounded = Math.round(v);
  return Number.isSafeInteger(rounded) ? rounded : null;
}

export type OutcomeSpace = {
  /** Ordered sequences with repeats allowed: N^k. */
  orderedWith: number;
  /** Unordered multisets: C(N + k − 1, k). */
  unorderedWith: number;
  /** Ordered without repeats: N! ÷ (N − k)!, or -Infinity when k > N. */
  orderedWithout: number;
  /** Unordered sets: C(N, k), or -Infinity when k > N. */
  unorderedWithout: number;
};

/** log10 of how many different results each kind of draw can produce. */
export function log10OutcomeSpace(n: number, k: number): OutcomeSpace {
  return {
    orderedWith: k * Math.log10(n),
    unorderedWith: log10Combination(n + k - 1, k),
    orderedWithout: k > n ? -Infinity : log10Factorial(n) - log10Factorial(n - k),
    unorderedWithout: log10Combination(n, k),
  };
}

/** The outcome-space size (log10) that matches the chosen settings: sorting discards the order. */
export function log10OutcomesFor(n: number, k: number, allowDuplicates: boolean, sorted: boolean): number {
  const s = log10OutcomeSpace(n, k);
  if (allowDuplicates) return sorted ? s.unorderedWith : s.orderedWith;
  return sorted ? s.unorderedWithout : s.orderedWithout;
}

/** Splits a log10 magnitude into mantissa × 10^exponent for display. */
export function sciParts(log10: number): { mantissa: number; exponent: number } {
  if (!Number.isFinite(log10)) return { mantissa: 0, exponent: 0 };
  let exponent = Math.floor(log10);
  let mantissa = 10 ** (log10 - exponent);
  if (mantissa >= 9.995) {
    mantissa = 1;
    exponent += 1;
  }
  return { mantissa, exponent };
}

export type EntropyZone = "guessable" | "weak" | "moderate" | "strong" | "cryptographic";

/** Bands for the bits of unpredictability in one result (thresholds in bits). */
export const ENTROPY_ZONES: { zone: EntropyZone; to: number }[] = [
  { zone: "guessable", to: 20 },
  { zone: "weak", to: 40 },
  { zone: "moderate", to: 64 },
  { zone: "strong", to: 128 },
  { zone: "cryptographic", to: Infinity },
];

export function entropyZone(bits: number): EntropyZone {
  return (ENTROPY_ZONES.find((z) => bits < z.to) ?? ENTROPY_ZONES[ENTROPY_ZONES.length - 1]).zone;
}

export type ModuloBias = {
  /** Bits of the hypothetical naive source (8, 16 or 32 — the smallest that covers N). */
  sourceBits: number;
  sourceSize: number;
  /** How many results get one extra source value (sourceSize mod N). */
  heavyValues: number;
  heavyProbability: number;
  lightProbability: number;
  uniformProbability: number;
  /** heavy ÷ light probability (1 = no bias). */
  biasRatio: number;
  /** Share of 32-bit draws this tool rejects and redraws to stay exactly uniform. */
  rejectionRate: number;
};

/** What `randomSourceValue % N` would do with the smallest whole-byte source, versus rejection sampling. */
export function moduloBias(n: number): ModuloBias {
  const sourceBits = n <= 256 ? 8 : n <= 65536 ? 16 : 32;
  const sourceSize = 2 ** sourceBits;
  const q = Math.floor(sourceSize / n);
  const r = sourceSize % n;
  const heavyProbability = (q + (r > 0 ? 1 : 0)) / sourceSize;
  const lightProbability = q / sourceSize;
  const two32 = 2 ** 32;
  return {
    sourceBits,
    sourceSize,
    heavyValues: r,
    heavyProbability,
    lightProbability,
    uniformProbability: 1 / n,
    biasRatio: lightProbability > 0 ? heavyProbability / lightProbability : Infinity,
    rejectionRate: n <= two32 ? (two32 % n) / two32 : (2 ** 53 % n) / 2 ** 53,
  };
}
