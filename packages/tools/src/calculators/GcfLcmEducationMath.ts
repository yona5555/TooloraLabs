/**
 * Pure helpers behind the GCF & LCM calculator's live indicators (no DOM). Every function works on
 * positive integers and mirrors the calculator's own pairwise reduction, so the drawings and tables
 * on the page always agree with the headline GCF / LCM.
 */
import type { PrimeFactor } from "./GcfLcmCalculator";

export function gcd2(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm2(a: number, b: number): number {
  const g = gcd2(a, b);
  return g === 0 ? 0 : (Math.abs(a) / g) * Math.abs(b);
}

export function gcdList(ns: number[]): number {
  return ns.reduce((acc, n) => gcd2(acc, n));
}

export function lcmList(ns: number[]): number {
  return ns.reduce((acc, n) => lcm2(acc, n));
}

/** Trial-division prime factorization, primes ascending. 1 → []. */
export function factorizeInt(n: number): PrimeFactor[] {
  const out: PrimeFactor[] = [];
  let r = n;
  for (let p = 2; p * p <= r; p++) {
    if (r % p === 0) {
      let e = 0;
      while (r % p === 0) {
        r /= p;
        e++;
      }
      out.push({ prime: p, exponent: e });
    }
  }
  if (r > 1) out.push({ prime: r, exponent: 1 });
  return out;
}

/** Ω(n): number of prime factors counted with multiplicity. */
export function bigOmega(n: number): number {
  return factorizeInt(n).reduce((s, f) => s + f.exponent, 0);
}

export type PrimeExponentRow = {
  prime: number;
  /** Exponent of the prime in each input number (0 when absent). */
  exponents: number[];
  /** min exponent → contributes prime^min to the GCF. */
  min: number;
  /** max exponent → contributes prime^max to the LCM. */
  max: number;
};

/** Union of all primes across the numbers with each number's exponent, the min (GCF) and max (LCM). */
export function primeExponentTable(ns: number[]): PrimeExponentRow[] {
  const facs = ns.map(factorizeInt);
  const primes = [...new Set(facs.flatMap((f) => f.map((x) => x.prime)))].sort((a, b) => a - b);
  return primes.map((prime) => {
    const exponents = facs.map((f) => f.find((x) => x.prime === prime)?.exponent ?? 0);
    return { prime, exponents, min: Math.min(...exponents), max: Math.max(...exponents) };
  });
}

/** Extended Euclid: x·s + y·t = gcd(x, y). */
export function bezout(x: number, y: number): { g: number; s: number; t: number } {
  let [r0, r1] = [x, y];
  let [s0, s1] = [1, 0];
  let [t0, t1] = [0, 1];
  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
    [t0, t1] = [t1, t0 - q * t1];
  }
  return { g: r0, s: s0, t: t0 };
}

/** All positive divisors of n, ascending. */
export function divisorsOf(n: number): number[] {
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d * d !== n) large.push(n / d);
    }
  }
  return [...small, ...large.reverse()];
}

/** Divisors shared by every number = divisors of their GCF. */
export function commonDivisors(ns: number[]): number[] {
  return divisorsOf(gcdList(ns));
}

export type TileSquare = { x: number; y: number; size: number; step: number };

/**
 * Euclid's algorithm drawn as geometry: the a × b rectangle is filled greedily with the largest
 * squares that fit; the last (smallest) square size is gcd(a, b). `step` is the Euclid step index
 * that produced each square. Capped at `maxSquares` (the rest of the rectangle is left uncovered).
 */
export function euclidTiling(a: number, b: number, maxSquares = 200): { squares: TileSquare[]; truncated: boolean } {
  const squares: TileSquare[] = [];
  let x = 0;
  let y = 0;
  let w = a;
  let h = b;
  let step = 0;
  while (w > 0 && h > 0) {
    if (w >= h) {
      const q = Math.floor(w / h);
      for (let i = 0; i < q; i++) {
        if (squares.length >= maxSquares) return { squares, truncated: true };
        squares.push({ x: x + i * h, y, size: h, step });
      }
      x += q * h;
      w -= q * h;
    } else {
      const q = Math.floor(h / w);
      for (let i = 0; i < q; i++) {
        if (squares.length >= maxSquares) return { squares, truncated: true };
        squares.push({ x, y: y + i * w, size: w, step });
      }
      y += q * w;
      h -= q * w;
    }
    step++;
  }
  return { squares, truncated: false };
}

export type LadderStep = { prime: number; before: number[]; after: number[] };

/**
 * The "ladder" (cake) method: divide every number by a prime they ALL share while one exists.
 * Product of the side primes = GCF; side primes × the bottom row's LCM = LCM.
 */
export function ladderSteps(ns: number[]): { steps: LadderStep[]; bottom: number[] } {
  let row = [...ns];
  const steps: LadderStep[] = [];
  for (;;) {
    const g = gcdList(row);
    if (g === 1) break;
    const p = factorizeInt(g)[0].prime;
    const next = row.map((n) => n / p);
    steps.push({ prime: p, before: row, after: next });
    row = next;
  }
  return { steps, bottom: row };
}

/** The first `count` multiples of n. */
export function multiplesOf(n: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => n * (i + 1));
}

/** How the numbers relate: coprime, share a factor, or the smallest divides every other. */
export function relationKind(ns: number[]): "coprime" | "shared" | "divides" | "equal" {
  const g = gcdList(ns);
  const min = Math.min(...ns);
  if (ns.every((n) => n === ns[0])) return "equal";
  if (g === 1) return "coprime";
  if (g === min) return "divides";
  return "shared";
}
