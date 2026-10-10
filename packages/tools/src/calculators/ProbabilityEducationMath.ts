/**
 * Pure math behind the Probability Calculator's live table, 3D outcome grid and indicators.
 * Every quantity is derived from one two-event joint model {P(A), P(B), P(A∩B)}; no DOM.
 */

export type JointProbability = { pA: number; pB: number; pAB: number };

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/** Clamps a joint model into the feasible region: 0 ≤ P ≤ 1 and max(0, P(A)+P(B)−1) ≤ P(A∩B) ≤ min(P(A), P(B)). */
export function clampJoint(j: JointProbability): JointProbability {
  const pA = clamp01(j.pA);
  const pB = clamp01(j.pB);
  const lo = Math.max(0, pA + pB - 1);
  const hi = Math.min(pA, pB);
  const pAB = Math.min(hi, Math.max(lo, clamp01(j.pAB)));
  return { pA, pB, pAB };
}

export type JointBreakdown = JointProbability & {
  notA: number;
  notB: number;
  union: number;
  aOnly: number;
  bOnly: number;
  neither: number;
  exactlyOne: number;
  /** P(A|B); NaN when P(B) = 0. */
  aGivenB: number;
  /** P(B|A); NaN when P(A) = 0. */
  bGivenA: number;
  /** P(A)·P(B), the intersection independence would predict. */
  independentProduct: number;
  /** Lift = P(A∩B) / (P(A)·P(B)); 1 means independent. NaN when the product is 0. */
  lift: number;
  /** Covariance of the two indicator variables, P(A∩B) − P(A)P(B). */
  covariance: number;
  /** Phi coefficient (correlation of the two indicators); NaN when either event is certain or impossible. */
  phi: number;
  relation: "independent" | "exclusive" | "positive" | "negative";
};

const EPS = 1e-9;

export function deriveJoint(input: JointProbability): JointBreakdown {
  const { pA, pB, pAB } = clampJoint(input);
  const union = pA + pB - pAB;
  const aOnly = pA - pAB;
  const bOnly = pB - pAB;
  const neither = 1 - union;
  const product = pA * pB;
  const covariance = pAB - product;
  const denom = Math.sqrt(pA * (1 - pA) * pB * (1 - pB));
  const relation: JointBreakdown["relation"] =
    Math.abs(covariance) < 1e-6 ? "independent" : pAB < EPS ? "exclusive" : covariance > 0 ? "positive" : "negative";
  return {
    pA,
    pB,
    pAB,
    notA: 1 - pA,
    notB: 1 - pB,
    union,
    aOnly,
    bOnly,
    neither: Math.max(0, neither),
    exactlyOne: aOnly + bOnly,
    aGivenB: pB > 0 ? pAB / pB : NaN,
    bGivenA: pA > 0 ? pAB / pA : NaN,
    independentProduct: product,
    lift: product > 0 ? pAB / product : NaN,
    covariance,
    phi: denom > 0 ? covariance / denom : NaN,
    relation,
  };
}

/** Odds for/against an event as ratios ("x : 1"); Infinity at the certain/impossible ends. */
export function oddsFromProbability(p: number): { oddsFor: number; oddsAgainst: number } {
  const q = clamp01(p);
  return { oddsFor: q >= 1 ? Infinity : q / (1 - q), oddsAgainst: q <= 0 ? Infinity : (1 - q) / q };
}

/** P(at least one success in n independent trials) = 1 − (1 − p)^n. */
export function atLeastOnce(p: number, n: number): number {
  return 1 - (1 - clamp01(p)) ** Math.max(0, n);
}

/** Smallest number of independent trials so that P(at least one success) ≥ confidence; Infinity when p = 0. */
export function trialsForConfidence(p: number, confidence: number): number {
  const q = clamp01(p);
  if (q <= 0) return Infinity;
  if (q >= 1) return 1;
  return Math.max(1, Math.ceil(Math.log(1 - confidence) / Math.log(1 - q) - 1e-12));
}

/** Binomial coefficient C(n, k) via a multiplicative loop (exact for the small n used on the page). */
export function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= kk; i++) c = (c * (n - kk + i)) / i;
  return Math.round(c);
}

/** P(X = k) for X ~ Binomial(n, p). */
export function binomialPmf(n: number, k: number, p: number): number {
  const q = clamp01(p);
  return binomialCoefficient(n, k) * q ** k * (1 - q) ** (n - k);
}

/** The whole Binomial(n, p) distribution, index k = number of successes. */
export function binomialDistribution(n: number, p: number): number[] {
  return Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, k, p));
}

/** Shannon surprisal −log₂ p in bits (Infinity for p = 0). */
export function surprisalBits(p: number): number {
  const q = clamp01(p);
  return q <= 0 ? Infinity : -Math.log2(q);
}

/** Binary entropy H(p) in bits. */
export function binaryEntropyBits(p: number): number {
  const q = clamp01(p);
  if (q <= 0 || q >= 1) return 0;
  return -q * Math.log2(q) - (1 - q) * Math.log2(1 - q);
}

/**
 * Splits `total` whole units (e.g. 100 cubes) across the four disjoint regions
 * [A∩B, A only, B only, neither] with the largest-remainder method, so the counts always sum to `total`.
 */
export function regionCounts(input: JointProbability, total = 100): [number, number, number, number] {
  const b = deriveJoint(input);
  const shares = [b.pAB, b.aOnly, b.bOnly, b.neither].map((s) => Math.max(0, s) * total);
  const floors = shares.map(Math.floor);
  let left = total - floors.reduce((a, v) => a + v, 0);
  const order = shares.map((s, i) => [s - Math.floor(s), i] as const).sort((x, y) => y[0] - x[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return floors as [number, number, number, number];
}

/** Area of the lens where two circles of radii r1, r2 overlap with centres d apart. */
export function circleOverlapArea(r1: number, r2: number, d: number): number {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return a + b - c;
}

/** Centre distance that makes the overlap of two circles equal `area` (bisection; overlap shrinks as d grows). */
export function circleDistanceForOverlap(r1: number, r2: number, area: number): number {
  const full = Math.PI * Math.min(r1, r2) ** 2;
  if (area <= 0) return r1 + r2;
  if (area >= full) return Math.abs(r1 - r2);
  let lo = Math.abs(r1 - r2);
  let hi = r1 + r2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (circleOverlapArea(r1, r2, mid) > area) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Deterministic [0, 1) generator (mulberry32) so simulations are reproducible and testable. */
export function seededUnitRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SimulationRun = {
  /** Running relative frequency of the event after trial i + 1. */
  running: number[];
  /** Total hits after all trials. */
  hits: number;
};

/** Simulates `trials` independent Bernoulli(p) trials with a seeded generator and records the running frequency. */
export function simulateBernoulli(p: number, trials: number, seed: number): SimulationRun {
  const rnd = seededUnitRandom(seed);
  const q = clamp01(p);
  const running: number[] = [];
  let hits = 0;
  for (let i = 0; i < trials; i++) {
    if (rnd() < q) hits += 1;
    running.push(hits / (i + 1));
  }
  return { running, hits };
}

/**
 * Draws `trials` independent outcomes of the joint model with a seeded generator and returns the
 * region of each: 0 = A∩B, 1 = A only, 2 = B only, 3 = neither.
 */
export function sampleRegions(input: JointProbability, trials: number, seed: number): number[] {
  const b = deriveJoint(input);
  const c1 = b.pAB;
  const c2 = c1 + b.aOnly;
  const c3 = c2 + b.bOnly;
  const rnd = seededUnitRandom(seed);
  const out: number[] = [];
  for (let i = 0; i < trials; i++) {
    const u = rnd();
    out.push(u < c1 ? 0 : u < c2 ? 1 : u < c3 ? 2 : 3);
  }
  return out;
}

/** Standard error of a frequency estimate after n trials, √(p(1−p)/n). */
export function standardError(p: number, n: number): number {
  const q = clamp01(p);
  return n > 0 ? Math.sqrt((q * (1 - q)) / n) : NaN;
}
