import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SortOrder = "none" | "ascending" | "descending";

export type RandomNumberGeneratorInput = {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
  sortOrder: SortOrder;
};

export type RandomNumberGeneratorError = "invalid-range" | "invalid-count" | "range-too-small";

export type RandomNumberGeneratorOutput = {
  error: RandomNumberGeneratorError | null;
  /** The numbers as displayed (after the chosen sort). */
  numbers: number[];
  /** The same numbers in the order they were drawn (before sorting) — what order-sensitive statistics use. */
  drawn: number[];
  lo: number;
  hi: number;
  sum: number;
  average: number;
};

export const RNG_MAX_COUNT = 10000;
/** Widest supported range: every integer in it must be exactly representable and reachable from 53 random bits. */
export const RNG_MAX_RANGE = 2 ** 53;

const TWO_32 = 2 ** 32;

/**
 * Mulberry32: a tiny, fast 32-bit generator with a full 2^32 period. Deterministic for a given
 * seed, so a draw can be reproduced exactly — and never suitable for secrets.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}

/** Adapts a [0, 1) source (e.g. Math.random) to the uint32 source the sampler needs. */
export function uint32FromUnit(random: () => number): () => number {
  return () => Math.min(TWO_32 - 1, Math.floor(random() * TWO_32));
}

/**
 * An exactly uniform integer in [0, n) by rejection sampling: draws that fall in the incomplete
 * top block (2^32 mod n values, or 2^53 mod n for ranges beyond 32 bits) are thrown away, so
 * every result has exactly the same number of source values mapping to it — no modulo bias.
 */
export function uniformIndex(n: number, next: () => number): number {
  if (n <= 1) return 0;
  if (n <= TWO_32) {
    const limit = TWO_32 - (TWO_32 % n);
    for (;;) {
      const x = next();
      if (x < limit) return x % n;
    }
  }
  const space = 2 ** 53;
  const limit = space - (space % n);
  for (;;) {
    const x = (next() >>> 11) * TWO_32 + next();
    if (x < limit) return x % n;
  }
}

function fisherYatesPrefix(size: number, take: number, next: () => number, offset: number): number[] {
  // Partial Fisher–Yates over a virtual array 0..size-1 (sparse map), so a huge range costs O(take).
  const swapped = new Map<number, number>();
  const out: number[] = [];
  for (let i = 0; i < take; i++) {
    const j = i + uniformIndex(size - i, next);
    const vi = swapped.get(i) ?? i;
    const vj = swapped.get(j) ?? j;
    swapped.set(j, vi);
    out.push(offset + vj);
  }
  return out;
}

/**
 * Draws `count` integers in [min, max] (bounds may be given in either order). With duplicates the
 * draws are independent and uniform; without, a partial Fisher–Yates shuffle samples uniformly
 * without replacement in O(count) even when the range is enormous.
 */
export function drawIntegers(input: RandomNumberGeneratorInput, next: () => number): RandomNumberGeneratorOutput {
  const { min, max, count, allowDuplicates, sortOrder } = input;
  const empty = { numbers: [], drawn: [], lo: 0, hi: 0, sum: 0, average: 0 };

  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) return { ...empty, error: "invalid-range" };
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const size = hi - lo + 1;
  if (size > RNG_MAX_RANGE) return { ...empty, error: "invalid-range" };
  if (!Number.isInteger(count) || count < 1 || count > RNG_MAX_COUNT) return { ...empty, error: "invalid-count" };
  if (!allowDuplicates && count > size) return { ...empty, error: "range-too-small" };

  const drawn = allowDuplicates ? Array.from({ length: count }, () => lo + uniformIndex(size, next)) : fisherYatesPrefix(size, count, next, lo);

  let numbers = drawn;
  if (sortOrder === "ascending") numbers = [...drawn].sort((a, b) => a - b);
  else if (sortOrder === "descending") numbers = [...drawn].sort((a, b) => b - a);

  const sum = drawn.reduce((s, n) => s + n, 0);
  return { error: null, numbers, drawn, lo, hi, sum, average: sum / count };
}

/** Backwards-compatible entry point taking a [0, 1) source (defaults to Math.random). */
export function generateRandomNumbers(input: RandomNumberGeneratorInput, random: () => number = Math.random): RandomNumberGeneratorOutput {
  return drawIntegers(input, uint32FromUnit(random));
}

export class RandomNumberGenerator extends BaseCalculator<RandomNumberGeneratorInput, RandomNumberGeneratorOutput> {
  metadata = {
    id: "random-number-generator",
    slug: "random-number-generator",
    name: "Random Number Generator",
    category: "math",
    description: "Generate random integers within a range, with control over count, duplicates, and sort order.",
    version: "2.0.0",
  };

  execute(input: RandomNumberGeneratorInput, _context: ToolContext): ToolResult<RandomNumberGeneratorOutput> {
    return { success: true, data: generateRandomNumbers(input), metadata: {} };
  }
}
