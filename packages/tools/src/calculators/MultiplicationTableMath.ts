/**
 * Pure arithmetic behind the Multiplication Table Generator's indicators. Every function works on
 * whole numbers and is exact (no floating point beyond safe-integer products), so the page can show
 * the same values the tests prove. No DOM, no locale: formatting happens in the web app.
 */

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** The landing points of skip counting by `a`, `b` times: 0, a, 2a, …, a·b. */
export function mtSkipCount(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= b; i++) out.push(a * i);
  return out;
}

/**
 * The friendly "break apart" split used by the area model: tens and ones when a ≥ 10, five and the
 * rest for 6–9, and no split (second part 0) for 1–5 or exact multiples of ten below 100.
 */
export function mtFriendlySplit(a: number): [number, number] {
  if (a >= 10) {
    const ones = a % 10;
    return ones === 0 ? [a, 0] : [a - ones, ones];
  }
  if (a > 5) return [5, a - 5];
  return [a, 0];
}

export type MtDistributive = { a: number; b: number; c: number; left: number; right: number; total: number };

/** a × b = a × c + a × (b − c), with the cut `c` clamped to 0…b. */
export function mtDistributive(a: number, b: number, c: number): MtDistributive {
  const cut = Math.min(b, Math.max(0, Math.round(c)));
  const left = a * cut;
  const right = a * (b - cut);
  return { a, b, c: cut, left, right, total: left + right };
}

export type MtNeighbours = { prev: number; current: number; next: number; step: number };

/** The facts on either side of a × b: they differ by exactly one group of a. */
export function mtNeighbours(a: number, b: number): MtNeighbours {
  return { prev: a * (b - 1), current: a * b, next: a * (b + 1), step: a };
}

/** Sum of the integers lo…hi (inclusive). */
export function mtRangeSum(lo: number, hi: number): number {
  if (hi < lo) return 0;
  return ((lo + hi) * (hi - lo + 1)) / 2;
}

export type MtRowSum = { products: number[]; sum: number; multiplierSum: number };

/** One row of a table: a × each multiplier, and its sum a × Σ multipliers. */
export function mtRowSum(a: number, multipliers: number[]): MtRowSum {
  const products = multipliers.map((m) => a * m);
  const multiplierSum = multipliers.reduce((s, m) => s + m, 0);
  return { products, sum: a * multiplierSum, multiplierSum };
}

/** Sum of every cell of the lo…hi square grid, which factorises as (Σ lo…hi)². */
export function mtGridSum(lo: number, hi: number): { side: number; sum: number } {
  const side = mtRangeSum(lo, hi);
  return { side, sum: side * side };
}

export type MtUnitsCycle = { digits: number[]; period: number; distinct: number[] };

/** Units digits of a × 1 … a × 10; they repeat every 10 ÷ gcd(a, 10) steps. */
export function mtUnitsCycle(a: number): MtUnitsCycle {
  const digits: number[] = [];
  for (let k = 1; k <= 10; k++) digits.push((a * k) % 10);
  const period = 10 / gcd(a % 10 === 0 ? 10 : a, 10);
  const distinct = [...new Set(digits.slice(0, period))].sort((x, y) => x - y);
  return { digits, period, distinct };
}

/** Digital root (repeated digit sum) of a positive integer: 1 + (n − 1) mod 9; 0 for 0. */
export function mtDigitalRoot(n: number): number {
  if (n === 0) return 0;
  return 1 + ((n - 1) % 9);
}

/** Digital roots of a × each multiplier; the pattern repeats every 9 / gcd(dr(a), 9) steps. */
export function mtDigitalRootRow(a: number, multipliers: number[]): { roots: number[]; period: number } {
  const roots = multipliers.map((m) => mtDigitalRoot(a * m));
  const dr = mtDigitalRoot(a);
  const period = 9 / gcd(dr === 9 ? 9 : dr, 9);
  return { roots, period };
}

/** Prime factorisation as ascending [prime, exponent] pairs; empty for 1. */
export function mtPrimeFactors(n: number): [number, number][] {
  const out: [number, number][] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    let e = 0;
    while (x % p === 0) {
      x /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (x > 1) out.push([x, 1]);
  return out;
}

/** Every factor pair i × j = n with i ≤ j (both ≥ 1). */
export function mtFactorPairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 1; i * i <= n; i++) if (n % i === 0) out.push([i, n / i]);
  return out;
}

/** How many cells of the lo…hi grid hold the value n (ordered pairs, so 3×8 and 8×3 count twice). */
export function mtCellsWithProduct(n: number, lo: number, hi: number): number {
  let count = 0;
  for (const [i, j] of mtFactorPairs(n)) {
    if (i >= lo && j <= hi) count += i === j ? 1 : 2;
  }
  return count;
}

export type MtMemoryStep = { key: "all" | "commutative" | "onesTens" | "twosFives" | "ninesElevens" | "squares"; remaining: number; removed: number };

/**
 * How many facts of the lo…hi grid are left to memorise after each standard shortcut: the full
 * grid, then a×b = b×a, then the ×1/×10 rules, the ×2/×5 doubles and halves, the ×9/×11 digit
 * patterns and finally the squares on the diagonal. Each step removes only facts still remaining.
 */
export function mtMemorySteps(lo: number, hi: number): MtMemoryStep[] {
  const pairs: [number, number][] = [];
  for (let i = lo; i <= hi; i++) for (let j = i; j <= hi; j++) pairs.push([i, j]);
  const all = (hi - lo + 1) ** 2;
  const steps: MtMemoryStep[] = [{ key: "all", remaining: all, removed: 0 }];
  steps.push({ key: "commutative", remaining: pairs.length, removed: all - pairs.length });
  const filters: [MtMemoryStep["key"], (i: number, j: number) => boolean][] = [
    ["onesTens", (i, j) => [1, 10].includes(i) || [1, 10].includes(j)],
    ["twosFives", (i, j) => [2, 5].includes(i) || [2, 5].includes(j)],
    ["ninesElevens", (i, j) => [9, 11].includes(i) || [9, 11].includes(j)],
    ["squares", (i, j) => i === j],
  ];
  let left = pairs;
  for (const [key, known] of filters) {
    const next = left.filter(([i, j]) => !known(i, j));
    steps.push({ key, remaining: next.length, removed: left.length - next.length });
    left = next;
  }
  return steps;
}

/** The facts still left after every shortcut in `mtMemorySteps`, as i ≤ j pairs. */
export function mtHardFacts(lo: number, hi: number): [number, number][] {
  const out: [number, number][] = [];
  const easy = new Set([1, 2, 5, 9, 10, 11]);
  for (let i = lo; i <= hi; i++) for (let j = i + 1; j <= hi; j++) if (!easy.has(i) && !easy.has(j)) out.push([i, j]);
  return out;
}

/** Number of different values in the lo…hi grid (Erdős's multiplication table problem for lo = 1). */
export function mtDistinctProducts(lo: number, hi: number): number {
  const seen = new Set<number>();
  for (let i = lo; i <= hi; i++) for (let j = i; j <= hi; j++) seen.add(i * j);
  return seen.size;
}

/** D(N) for the 1…N grid, N = 1 … maxN, with the share D(N) / N² of the N² cells. */
export function mtDistinctTrend(maxN: number): { n: number; distinct: number; share: number }[] {
  const out: { n: number; distinct: number; share: number }[] = [];
  const seen = new Set<number>();
  for (let n = 1; n <= maxN; n++) {
    for (let i = 1; i <= n; i++) seen.add(i * n);
    out.push({ n, distinct: seen.size, share: seen.size / (n * n) });
  }
  return out;
}

/** a × b as a difference of squares, ((a+b)/2)² − ((b−a)/2)², exact only when a and b share parity. */
export function mtDifferenceOfSquares(a: number, b: number): { mid: number; half: number; exact: boolean } {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return { mid: (lo + hi) / 2, half: (hi - lo) / 2, exact: (lo + hi) % 2 === 0 };
}
