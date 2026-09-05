import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MeanMedianModeRangeInput = {
  values: number[];
};

export type MeanMedianModeRangeError = "empty-dataset";

export type MeanMedianModeRangeOutput = {
  error: MeanMedianModeRangeError | null;
  count: number;
  sum: number;
  mean: number;
  sortedValues: number[];
  median: number;
  mode: number[];
  hasMode: boolean;
  min: number;
  max: number;
  range: number;
};

function computeMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * A value only counts as "the mode" if it appears more often than every other value. When every
 * value appears exactly once (the maximum frequency is 1), nothing repeats more than anything
 * else, so the data set is conventionally treated as having no mode at all, rather than every
 * value being one.
 */
function computeMode(values: number[]): { mode: number[]; hasMode: boolean } {
  const frequency = new Map<number, number>();
  for (const v of values) frequency.set(v, (frequency.get(v) ?? 0) + 1);

  const maxFrequency = Math.max(...frequency.values());
  if (maxFrequency <= 1) return { mode: [], hasMode: false };

  const mode = [...frequency.entries()].filter(([, count]) => count === maxFrequency).map(([value]) => value);
  return { mode: mode.sort((a, b) => a - b), hasMode: true };
}

export class MeanMedianModeRangeCalculator extends BaseCalculator<MeanMedianModeRangeInput, MeanMedianModeRangeOutput> {
  metadata = {
    id: "mean-median-mode-range-calculator",
    slug: "mean-median-mode-range-calculator",
    name: "Mean, Median, Mode, Range Calculator",
    category: "math",
    description: "Calculate the mean, median, mode, and range of a data set, with a breakdown of how each measure is derived.",
    version: "1.0.0",
  };

  execute(input: MeanMedianModeRangeInput, _context: ToolContext): ToolResult<MeanMedianModeRangeOutput> {
    const { values } = input;

    if (values.length === 0) {
      return {
        success: true,
        data: {
          error: "empty-dataset",
          count: 0,
          sum: 0,
          mean: 0,
          sortedValues: [],
          median: 0,
          mode: [],
          hasMode: false,
          min: 0,
          max: 0,
          range: 0,
        },
        metadata: {},
      };
    }

    const count = values.length;
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = sum / count;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = computeMedian(sortedValues);
    const { mode, hasMode } = computeMode(values);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];

    return {
      success: true,
      data: { error: null, count, sum, mean, sortedValues, median, mode, hasMode, min, max, range: max - min },
      metadata: {},
    };
  }
}
