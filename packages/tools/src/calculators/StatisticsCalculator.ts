import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type StatisticsCalculatorInput = {
  values: number[];
};

export type StatisticsCalculatorError = "empty-dataset";

export type StatisticsCalculatorOutput = {
  error: StatisticsCalculatorError | null;
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  populationVariance: number;
  populationStdDev: number;
  sampleVariance: number;
  sampleStdDev: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

function computeMedian(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function computeMode(values: number[]): number[] {
  const frequency = new Map<number, number>();
  for (const value of values) {
    frequency.set(value, (frequency.get(value) ?? 0) + 1);
  }
  const maxFrequency = Math.max(...frequency.values());
  if (maxFrequency <= 1) return [];
  return [...frequency.entries()]
    .filter(([, count]) => count === maxFrequency)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

export class StatisticsCalculator extends BaseCalculator<StatisticsCalculatorInput, StatisticsCalculatorOutput> {
  metadata = {
    id: "statistics-calculator",
    slug: "statistics-calculator",
    name: "Statistics Calculator",
    category: "math-science",
    description: "Calculate mean, median, mode, range, variance, and standard deviation for a data set.",
    version: "1.0.0",
  };

  execute(input: StatisticsCalculatorInput, _context: ToolContext): ToolResult<StatisticsCalculatorOutput> {
    const { values } = input;

    if (values.length === 0) {
      return this.errorResult();
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;
    const median = computeMedian(sorted);
    const mode = computeMode(values);
    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    const squaredDiffs = values.map((v) => (v - mean) ** 2);
    const sumSquaredDiffs = squaredDiffs.reduce((acc, v) => acc + v, 0);
    const populationVariance = sumSquaredDiffs / count;
    const sampleVariance = count > 1 ? sumSquaredDiffs / (count - 1) : 0;

    return {
      success: true,
      data: {
        error: null,
        count,
        sum: clean(sum),
        mean: clean(mean),
        median: clean(median),
        mode: mode.map(clean),
        min: clean(min),
        max: clean(max),
        range: clean(range),
        populationVariance: clean(populationVariance),
        populationStdDev: clean(Math.sqrt(populationVariance)),
        sampleVariance: clean(sampleVariance),
        sampleStdDev: clean(Math.sqrt(sampleVariance)),
      },
      metadata: {},
    };
  }

  private errorResult(): ToolResult<StatisticsCalculatorOutput> {
    return {
      success: true,
      data: {
        error: "empty-dataset",
        count: 0,
        sum: 0,
        mean: 0,
        median: 0,
        mode: [],
        min: 0,
        max: 0,
        range: 0,
        populationVariance: 0,
        populationStdDev: 0,
        sampleVariance: 0,
        sampleStdDev: 0,
      },
      metadata: {},
    };
  }
}
