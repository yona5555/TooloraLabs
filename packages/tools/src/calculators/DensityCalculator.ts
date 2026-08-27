import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DensityOperation = "solveDensity" | "solveMass" | "solveVolume";

export type DensityCalculatorInput = {
  operation: DensityOperation;
  mass: number;
  volume: number;
  density: number;
};

export type DensityCalculatorError = "zero-volume" | "zero-density";

export type DensityCalculatorOutput = {
  error: DensityCalculatorError | null;
  mass: number;
  volume: number;
  density: number;
  densitySI: number;
  specificGravity: number;
};

const WATER_DENSITY_G_PER_CM3 = 1.0;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class DensityCalculator extends BaseCalculator<DensityCalculatorInput, DensityCalculatorOutput> {
  metadata = {
    id: "density-calculator",
    slug: "density-calculator",
    name: "Density Calculator",
    category: "math-science",
    description: "Solve for density, mass, or volume, with the SI equivalent and specific gravity relative to water.",
    version: "1.0.0",
  };

  execute(input: DensityCalculatorInput, _context: ToolContext): ToolResult<DensityCalculatorOutput> {
    const { operation, mass, volume, density } = input;

    if (operation === "solveDensity" && volume === 0) {
      return this.errorResult("zero-volume");
    }
    if (operation === "solveVolume" && density === 0) {
      return this.errorResult("zero-density");
    }

    let resultMass = mass;
    let resultVolume = volume;
    let resultDensity = density;

    if (operation === "solveDensity") {
      resultDensity = mass / volume;
    } else if (operation === "solveMass") {
      resultMass = density * volume;
    } else {
      resultVolume = mass / density;
    }

    return {
      success: true,
      data: {
        error: null,
        mass: clean(resultMass),
        volume: clean(resultVolume),
        density: clean(resultDensity),
        densitySI: clean(resultDensity * 1000),
        specificGravity: clean(resultDensity / WATER_DENSITY_G_PER_CM3),
      },
      metadata: {},
    };
  }

  private errorResult(error: DensityCalculatorError): ToolResult<DensityCalculatorOutput> {
    return {
      success: true,
      data: { error, mass: 0, volume: 0, density: 0, densitySI: 0, specificGravity: 0 },
      metadata: {},
    };
  }
}
