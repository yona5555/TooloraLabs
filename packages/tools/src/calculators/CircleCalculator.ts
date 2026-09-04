import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type CircleKnownField = "radius" | "diameter" | "circumference" | "area";

export type CircleCalculatorInput = {
  knownField: CircleKnownField;
  value: number;
};

export type CircleCalculatorError = "invalid-value";

export type CircleCalculatorOutput = {
  error: CircleCalculatorError | null;
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
};

/**
 * Every property of a circle is a fixed function of its radius alone, so unlike a triangle or
 * a general quadrilateral, one known measurement (any of the four) is always enough to derive
 * the other three — there's no "under-determined" case to guard against here.
 */
export class CircleCalculator extends BaseCalculator<CircleCalculatorInput, CircleCalculatorOutput> {
  metadata = {
    id: "circle-calculator",
    slug: "circle-calculator",
    name: "Circle Calculator",
    category: "math",
    description: "Calculate a circle's radius, diameter, circumference, and area from any one of the four.",
    version: "1.0.0",
  };

  execute(input: CircleCalculatorInput, _context: ToolContext): ToolResult<CircleCalculatorOutput> {
    const { knownField, value } = input;
    const empty: CircleCalculatorOutput = { error: "invalid-value", radius: 0, diameter: 0, circumference: 0, area: 0 };

    if (!Number.isFinite(value) || value <= 0) {
      return { success: true, data: empty, metadata: {} };
    }

    let radius: number;
    switch (knownField) {
      case "radius":
        radius = value;
        break;
      case "diameter":
        radius = value / 2;
        break;
      case "circumference":
        radius = value / (2 * Math.PI);
        break;
      case "area":
        radius = Math.sqrt(value / Math.PI);
        break;
    }

    return {
      success: true,
      data: {
        error: null,
        radius,
        diameter: radius * 2,
        circumference: 2 * Math.PI * radius,
        area: Math.PI * radius * radius,
      },
      metadata: {},
    };
  }
}
