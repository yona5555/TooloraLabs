import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type UnitCategory = "length" | "weight" | "temperature";

export type UnitConverterInput = {
  category: UnitCategory;
  from: string;
  to: string;
  value: number;
};

export type UnitConverterOutput = {
  value: number;
  result: number;
};

const LENGTH_FACTORS: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const WEIGHT_FACTORS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1_000_000,
  oz: 28.3495,
  lb: 453.592,
};

function convertLinear(
  value: number,
  from: string,
  to: string,
  factors: Record<string, number>
): number | null {
  if (!(from in factors) || !(to in factors)) {
    return null;
  }
  const base = value * factors[from];
  return base / factors[to];
}

function toCelsius(value: number, unit: string): number | null {
  switch (unit) {
    case "celsius":
      return value;
    case "fahrenheit":
      return ((value - 32) * 5) / 9;
    case "kelvin":
      return value - 273.15;
    default:
      return null;
  }
}

function fromCelsius(value: number, unit: string): number | null {
  switch (unit) {
    case "celsius":
      return value;
    case "fahrenheit":
      return (value * 9) / 5 + 32;
    case "kelvin":
      return value + 273.15;
    default:
      return null;
  }
}

export class UnitConverter extends BaseTool<
  UnitConverterInput,
  UnitConverterOutput
> {
  metadata = {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Unit Converter",
    category: "converters",
    description: "Convert length, weight, temperature and more.",
    version: "1.0.0",
  };

  execute(
    input: UnitConverterInput,
    _context: ToolContext
  ): ToolResult<UnitConverterOutput> {
    let result: number | null;

    if (input.category === "length") {
      result = convertLinear(input.value, input.from, input.to, LENGTH_FACTORS);
    } else if (input.category === "weight") {
      result = convertLinear(input.value, input.from, input.to, WEIGHT_FACTORS);
    } else {
      const celsius = toCelsius(input.value, input.from);
      result = celsius === null ? null : fromCelsius(celsius, input.to);
    }

    if (result === null) {
      return {
        success: false,
        data: { value: input.value, result: 0 },
        metadata: { error: "Unsupported unit for this category" },
      };
    }

    return {
      success: true,
      data: { value: input.value, result: Number(result.toFixed(6)) },
      metadata: {},
    };
  }
}
