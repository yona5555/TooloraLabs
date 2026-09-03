import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import type { Solid3DShape } from "./SurfaceAreaCalculator";

export type VolumeCalculatorInput = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

export type VolumeCalculatorError = "missing-dimension" | "invalid-dimension";

export type VolumeCalculatorOutput = {
  error: VolumeCalculatorError | null;
  errorDetail: string | null;
  volume: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

function positive(...values: Array<number | undefined>): boolean {
  return values.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}

/**
 * Computes the volume of a 3D solid from the same dimension fields used by
 * SurfaceAreaCalculator (radius + perpendicular height for the cone, base
 * side + perpendicular height for the square pyramid), so the two tools
 * accept identical inputs for identical shapes.
 */
export class VolumeCalculator extends BaseCalculator<VolumeCalculatorInput, VolumeCalculatorOutput> {
  metadata = {
    id: "volume-calculator",
    slug: "volume-calculator",
    name: "Volume Calculator",
    category: "math-science",
    description: "Calculate the volume of cubes, rectangular prisms, spheres, cylinders, cones, and square pyramids.",
    version: "1.0.0",
  };

  execute(input: VolumeCalculatorInput, _context: ToolContext): ToolResult<VolumeCalculatorOutput> {
    const { shape } = input;

    switch (shape) {
      case "cube": {
        if (input.side === undefined) return this.missing("Enter the side length.");
        if (!positive(input.side)) return this.invalid();
        return this.ok(input.side ** 3);
      }
      case "rectangular-prism": {
        if (input.length === undefined || input.width === undefined || input.height === undefined) {
          return this.missing("Enter the length, width, and height.");
        }
        if (!positive(input.length, input.width, input.height)) return this.invalid();
        return this.ok(input.length * input.width * input.height);
      }
      case "sphere": {
        if (input.radius === undefined) return this.missing("Enter the radius.");
        if (!positive(input.radius)) return this.invalid();
        return this.ok((4 / 3) * Math.PI * input.radius ** 3);
      }
      case "cylinder": {
        if (input.radius === undefined || input.height === undefined) return this.missing("Enter both the radius and height.");
        if (!positive(input.radius, input.height)) return this.invalid();
        return this.ok(Math.PI * input.radius * input.radius * input.height);
      }
      case "cone": {
        if (input.radius === undefined || input.height === undefined) return this.missing("Enter both the radius and height.");
        if (!positive(input.radius, input.height)) return this.invalid();
        return this.ok((1 / 3) * Math.PI * input.radius * input.radius * input.height);
      }
      case "square-pyramid": {
        if (input.baseSide === undefined || input.height === undefined) return this.missing("Enter both the base side and height.");
        if (!positive(input.baseSide, input.height)) return this.invalid();
        return this.ok((1 / 3) * input.baseSide * input.baseSide * input.height);
      }
    }
  }

  private ok(volume: number): ToolResult<VolumeCalculatorOutput> {
    return { success: true, data: { error: null, errorDetail: null, volume: clean(volume) }, metadata: {} };
  }

  private missing(detail: string): ToolResult<VolumeCalculatorOutput> {
    return { success: true, data: { error: "missing-dimension", errorDetail: detail, volume: 0 }, metadata: {} };
  }

  private invalid(): ToolResult<VolumeCalculatorOutput> {
    return { success: true, data: { error: "invalid-dimension", errorDetail: "All dimensions must be positive numbers.", volume: 0 }, metadata: {} };
  }
}
