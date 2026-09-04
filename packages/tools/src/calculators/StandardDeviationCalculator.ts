import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type StandardDeviationInput = {
  values: number[];
};

export type StandardDeviationError = "empty-dataset";

export type DeviationRow = {
  value: number;
  deviation: number;
  squaredDeviation: number;
};

export type StandardDeviationOutput = {
  error: StandardDeviationError | null;
  count: number;
  mean: number;
  sumOfSquaredDeviations: number;
  populationVariance: number;
  populationStdDev: number;
  sampleVariance: number;
  sampleStdDev: number;
  deviations: DeviationRow[];
};

/**
 * Computes both the population and sample standard deviation for a data set, along with the
 * per-value deviations table so the "why" (subtract the mean, square it, average it, root it)
 * stays visible alongside the two final numbers. Sample variance/stdDev use Bessel's correction
 * (dividing by n-1 instead of n) and are left at 0 for a single-value data set, since dividing
 * by zero there is undefined — population statistics remain valid down to a single value.
 */
export class StandardDeviationCalculator extends BaseCalculator<StandardDeviationInput, StandardDeviationOutput> {
  metadata = {
    id: "standard-deviation-calculator",
    slug: "standard-deviation-calculator",
    name: "Standard Deviation Calculator",
    category: "math",
    description: "Calculate population and sample standard deviation, variance, and mean for a data set, with every step shown.",
    version: "1.0.0",
  };

  execute(input: StandardDeviationInput, _context: ToolContext): ToolResult<StandardDeviationOutput> {
    const { values } = input;

    if (values.length === 0) {
      return {
        success: true,
        data: {
          error: "empty-dataset",
          count: 0,
          mean: 0,
          sumOfSquaredDeviations: 0,
          populationVariance: 0,
          populationStdDev: 0,
          sampleVariance: 0,
          sampleStdDev: 0,
          deviations: [],
        },
        metadata: {},
      };
    }

    const count = values.length;
    const mean = values.reduce((s, v) => s + v, 0) / count;
    const deviations: DeviationRow[] = values.map((value) => {
      const deviation = value - mean;
      return { value, deviation, squaredDeviation: deviation * deviation };
    });
    const sumOfSquaredDeviations = deviations.reduce((s, d) => s + d.squaredDeviation, 0);

    const populationVariance = sumOfSquaredDeviations / count;
    const populationStdDev = Math.sqrt(populationVariance);
    const sampleVariance = count > 1 ? sumOfSquaredDeviations / (count - 1) : 0;
    const sampleStdDev = Math.sqrt(sampleVariance);

    return {
      success: true,
      data: {
        error: null,
        count,
        mean,
        sumOfSquaredDeviations,
        populationVariance,
        populationStdDev,
        sampleVariance,
        sampleStdDev,
        deviations,
      },
      metadata: {},
    };
  }
}
