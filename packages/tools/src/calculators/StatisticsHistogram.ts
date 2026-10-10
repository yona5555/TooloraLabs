/**
 * Pure helpers behind the statistics-calculator live 3D histogram and its
 * table: Sturges binning, bin counts and quartiles. No DOM, unit-tested in
 * __tests__/StatisticsHistogram.test.ts.
 */

export type StatsHistogramBin = {
  start: number;
  end: number;
  count: number;
  /** count / n, 0..1 */
  relative: number;
};

export type StatsHistogram = {
  bins: StatsHistogramBin[];
  binCount: number;
  binWidth: number;
  /** Sturges' rule input: ⌈log₂ n⌉ + 1 before clamping. */
  sturges: number;
  maxCount: number;
};

const MAX_BINS = 12;

function clean(n: number): number {
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? 0 : r;
}

/** Sturges' rule k = ⌈log₂ n⌉ + 1, clamped to 1..12 so the 3D bars stay readable. */
export function sturgesBinCount(n: number): number {
  if (n <= 1) return 1;
  return Math.min(MAX_BINS, Math.max(1, Math.ceil(Math.log2(n)) + 1));
}

/**
 * Equal-width histogram over [min, max]. The last bin is closed on the right
 * so the maximum is always counted. A constant dataset gets one bin of width 1
 * centred on the value.
 */
export function buildHistogram(values: number[], binCountOverride?: number): StatsHistogram {
  const finite = values.filter((v) => Number.isFinite(v));
  const n = finite.length;
  if (n === 0) return { bins: [], binCount: 0, binWidth: 0, sturges: 0, maxCount: 0 };
  const sturges = n <= 1 ? 1 : Math.ceil(Math.log2(n)) + 1;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (max === min) {
    return {
      bins: [{ start: clean(min - 0.5), end: clean(min + 0.5), count: n, relative: 1 }],
      binCount: 1,
      binWidth: 1,
      sturges,
      maxCount: n,
    };
  }
  const k = binCountOverride && binCountOverride > 0 ? Math.min(MAX_BINS, Math.floor(binCountOverride)) : sturgesBinCount(n);
  const width = (max - min) / k;
  const counts = new Array<number>(k).fill(0);
  for (const v of finite) {
    const i = Math.min(k - 1, Math.floor((v - min) / width));
    counts[i] += 1;
  }
  const bins = counts.map((count, i) => ({
    start: clean(min + i * width),
    end: clean(i === k - 1 ? max : min + (i + 1) * width),
    count,
    relative: clean(count / n),
  }));
  return { bins, binCount: k, binWidth: clean(width), sturges, maxCount: Math.max(...counts) };
}

export type StatsQuartiles = { q1: number; q2: number; q3: number; iqr: number };

function medianOf(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Tukey's hinges (median of each half, middle value excluded for odd n). */
export function computeQuartiles(values: number[]): StatsQuartiles {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return { q1: 0, q2: 0, q3: 0, iqr: 0 };
  if (n === 1) return { q1: sorted[0], q2: sorted[0], q3: sorted[0], iqr: 0 };
  const half = Math.floor(n / 2);
  const lower = sorted.slice(0, half);
  const upper = sorted.slice(n % 2 === 0 ? half : half + 1);
  const q1 = medianOf(lower);
  const q3 = medianOf(upper);
  return { q1: clean(q1), q2: clean(medianOf(sorted)), q3: clean(q3), iqr: clean(q3 - q1) };
}
