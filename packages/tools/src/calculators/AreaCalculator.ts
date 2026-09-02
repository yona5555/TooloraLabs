import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type AreaShape = "square" | "rectangle" | "triangle" | "circle" | "ellipse" | "trapezoid" | "parallelogram" | "sector";

export type AreaCalculatorInput = {
  shape: AreaShape;
  side?: number;
  width?: number;
  height?: number;
  base?: number;
  radius?: number;
  semiMajorAxis?: number;
  semiMinorAxis?: number;
  base1?: number;
  base2?: number;
  angleDegrees?: number;
};

export type AreaCalculatorError = "missing-dimension" | "invalid-dimension";

export type AreaCalculatorOutput = {
  error: AreaCalculatorError | null;
  errorDetail: string | null;
  area: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

function positive(...values: Array<number | undefined>): boolean {
  return values.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}

/**
 * Computes the area of a plane figure from its defining dimensions. Each
 * shape uses the standard closed-form Euclidean-geometry area formula;
 * inputs are validated as strictly positive finite numbers before use.
 */
export class AreaCalculator extends BaseCalculator<AreaCalculatorInput, AreaCalculatorOutput> {
  metadata = {
    id: "area-calculator",
    slug: "area-calculator",
    name: "Area Calculator",
    category: "math-science",
    description: "Calculate the area of squares, rectangles, triangles, circles, ellipses, trapezoids, parallelograms, and circular sectors.",
    version: "1.0.0",
  };

  execute(input: AreaCalculatorInput, _context: ToolContext): ToolResult<AreaCalculatorOutput> {
    const { shape } = input;

    switch (shape) {
      case "square": {
        if (input.side === undefined) return this.missing("Enter the side length.");
        if (!positive(input.side)) return this.invalid();
        return this.ok(input.side * input.side);
      }
      case "rectangle": {
        if (input.width === undefined || input.height === undefined) return this.missing("Enter both the width and height.");
        if (!positive(input.width, input.height)) return this.invalid();
        return this.ok(input.width * input.height);
      }
      case "triangle": {
        if (input.base === undefined || input.height === undefined) return this.missing("Enter both the base and height.");
        if (!positive(input.base, input.height)) return this.invalid();
        return this.ok(0.5 * input.base * input.height);
      }
      case "circle": {
        if (input.radius === undefined) return this.missing("Enter the radius.");
        if (!positive(input.radius)) return this.invalid();
        return this.ok(Math.PI * input.radius * input.radius);
      }
      case "ellipse": {
        if (input.semiMajorAxis === undefined || input.semiMinorAxis === undefined) return this.missing("Enter both semi-axes.");
        if (!positive(input.semiMajorAxis, input.semiMinorAxis)) return this.invalid();
        return this.ok(Math.PI * input.semiMajorAxis * input.semiMinorAxis);
      }
      case "trapezoid": {
        if (input.base1 === undefined || input.base2 === undefined || input.height === undefined) {
          return this.missing("Enter both parallel sides and the height.");
        }
        if (!positive(input.base1, input.base2, input.height)) return this.invalid();
        return this.ok(0.5 * (input.base1 + input.base2) * input.height);
      }
      case "parallelogram": {
        if (input.base === undefined || input.height === undefined) return this.missing("Enter both the base and height.");
        if (!positive(input.base, input.height)) return this.invalid();
        return this.ok(input.base * input.height);
      }
      case "sector": {
        if (input.radius === undefined || input.angleDegrees === undefined) return this.missing("Enter both the radius and the angle.");
        if (!positive(input.radius, input.angleDegrees)) return this.invalid();
        if (input.angleDegrees > 360) return this.invalid("The angle can't exceed 360 degrees.");
        return this.ok((input.angleDegrees / 360) * Math.PI * input.radius * input.radius);
      }
    }
  }

  private ok(area: number): ToolResult<AreaCalculatorOutput> {
    return { success: true, data: { error: null, errorDetail: null, area: clean(area) }, metadata: {} };
  }

  private missing(detail: string): ToolResult<AreaCalculatorOutput> {
    return { success: true, data: { error: "missing-dimension", errorDetail: detail, area: 0 }, metadata: {} };
  }

  private invalid(detail = "All dimensions must be positive numbers."): ToolResult<AreaCalculatorOutput> {
    return { success: true, data: { error: "invalid-dimension", errorDetail: detail, area: 0 }, metadata: {} };
  }
}
