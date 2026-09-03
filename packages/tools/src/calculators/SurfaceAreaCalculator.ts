import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type Solid3DShape = "cube" | "rectangular-prism" | "sphere" | "cylinder" | "cone" | "square-pyramid";

export type SurfaceAreaCalculatorInput = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

export type SurfaceAreaCalculatorError = "missing-dimension" | "invalid-dimension";

export type SurfaceAreaCalculatorOutput = {
  error: SurfaceAreaCalculatorError | null;
  errorDetail: string | null;
  surfaceArea: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

function positive(...values: Array<number | undefined>): boolean {
  return values.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}

/**
 * Computes the total surface area of a 3D solid from its defining
 * dimensions. For the cone and square pyramid, the slant height is derived
 * from the given perpendicular height (via the Pythagorean theorem) rather
 * than asked for directly, since a perpendicular height is what a user
 * typically has on hand.
 */
export class SurfaceAreaCalculator extends BaseCalculator<SurfaceAreaCalculatorInput, SurfaceAreaCalculatorOutput> {
  metadata = {
    id: "surface-area-calculator",
    slug: "surface-area-calculator",
    name: "Surface Area Calculator",
    category: "math-science",
    description: "Calculate the total surface area of cubes, rectangular prisms, spheres, cylinders, cones, and square pyramids.",
    version: "1.0.0",
  };

  execute(input: SurfaceAreaCalculatorInput, _context: ToolContext): ToolResult<SurfaceAreaCalculatorOutput> {
    const { shape } = input;

    switch (shape) {
      case "cube": {
        if (input.side === undefined) return this.missing("Enter the side length.");
        if (!positive(input.side)) return this.invalid();
        return this.ok(6 * input.side * input.side);
      }
      case "rectangular-prism": {
        if (input.length === undefined || input.width === undefined || input.height === undefined) {
          return this.missing("Enter the length, width, and height.");
        }
        if (!positive(input.length, input.width, input.height)) return this.invalid();
        return this.ok(2 * (input.length * input.width + input.length * input.height + input.width * input.height));
      }
      case "sphere": {
        if (input.radius === undefined) return this.missing("Enter the radius.");
        if (!positive(input.radius)) return this.invalid();
        return this.ok(4 * Math.PI * input.radius * input.radius);
      }
      case "cylinder": {
        if (input.radius === undefined || input.height === undefined) return this.missing("Enter both the radius and height.");
        if (!positive(input.radius, input.height)) return this.invalid();
        return this.ok(2 * Math.PI * input.radius * (input.radius + input.height));
      }
      case "cone": {
        if (input.radius === undefined || input.height === undefined) return this.missing("Enter both the radius and height.");
        if (!positive(input.radius, input.height)) return this.invalid();
        const slant = Math.sqrt(input.radius * input.radius + input.height * input.height);
        return this.ok(Math.PI * input.radius * (input.radius + slant));
      }
      case "square-pyramid": {
        if (input.baseSide === undefined || input.height === undefined) return this.missing("Enter both the base side and height.");
        if (!positive(input.baseSide, input.height)) return this.invalid();
        const slant = Math.sqrt(input.height * input.height + (input.baseSide / 2) * (input.baseSide / 2));
        return this.ok(input.baseSide * input.baseSide + 2 * input.baseSide * slant);
      }
    }
  }

  private ok(surfaceArea: number): ToolResult<SurfaceAreaCalculatorOutput> {
    return { success: true, data: { error: null, errorDetail: null, surfaceArea: clean(surfaceArea) }, metadata: {} };
  }

  private missing(detail: string): ToolResult<SurfaceAreaCalculatorOutput> {
    return { success: true, data: { error: "missing-dimension", errorDetail: detail, surfaceArea: 0 }, metadata: {} };
  }

  private invalid(): ToolResult<SurfaceAreaCalculatorOutput> {
    return { success: true, data: { error: "invalid-dimension", errorDetail: "All dimensions must be positive numbers.", surfaceArea: 0 }, metadata: {} };
  }
}
