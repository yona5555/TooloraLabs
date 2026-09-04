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
  numbers: number[];
  sum: number;
  average: number;
};

const MAX_COUNT = 10000;

function fisherYatesShuffle<T>(items: T[], random: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates `count` random integers in [min, max]. When duplicates are disallowed, the full
 * range is shuffled (Fisher-Yates) and the first `count` values are taken — this samples
 * uniformly without replacement, unlike rejection-sampling one value at a time, which gets
 * slower (and can loop indefinitely near the range's size) as the requested count approaches
 * the total range size.
 */
export function generateRandomNumbers(input: RandomNumberGeneratorInput, random: () => number = Math.random): RandomNumberGeneratorOutput {
  const { min, max, count, allowDuplicates, sortOrder } = input;
  const empty: RandomNumberGeneratorOutput = { error: null, numbers: [], sum: 0, average: 0 };

  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return { ...empty, error: "invalid-range" };
  }
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    return { ...empty, error: "invalid-count" };
  }

  const rangeSize = hi - lo + 1;
  if (!allowDuplicates && count > rangeSize) {
    return { ...empty, error: "range-too-small" };
  }

  let numbers: number[];
  if (allowDuplicates) {
    numbers = Array.from({ length: count }, () => lo + Math.floor(random() * rangeSize));
  } else {
    const pool = Array.from({ length: rangeSize }, (_, i) => lo + i);
    numbers = fisherYatesShuffle(pool, random).slice(0, count);
  }

  if (sortOrder === "ascending") numbers = [...numbers].sort((a, b) => a - b);
  else if (sortOrder === "descending") numbers = [...numbers].sort((a, b) => b - a);

  const sum = numbers.reduce((s, n) => s + n, 0);
  const average = sum / numbers.length;

  return { error: null, numbers, sum, average };
}

export class RandomNumberGenerator extends BaseCalculator<RandomNumberGeneratorInput, RandomNumberGeneratorOutput> {
  metadata = {
    id: "random-number-generator",
    slug: "random-number-generator",
    name: "Random Number Generator",
    category: "math",
    description: "Generate random integers within a range, with control over count, duplicates, and sort order.",
    version: "1.0.0",
  };

  execute(input: RandomNumberGeneratorInput, _context: ToolContext): ToolResult<RandomNumberGeneratorOutput> {
    return { success: true, data: generateRandomNumbers(input), metadata: {} };
  }
}
