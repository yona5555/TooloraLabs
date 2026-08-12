import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type UnitCategory = "length" | "weight" | "temperature" | "area" | "volume" | "speed";

export type UnitConverterInput = {
  category: UnitCategory;
  from: string;
  to: string;
  value: number;
};

export type UnitConverterOutput = {
  value: number;
  result: number;
  /** The same input value converted into every unit in the category, keyed by unit symbol. */
  allConversions: Record<string, number>;
};

/** Base unit per category: meter, kilogram, m², liter, m/s. Temperature is handled separately (non-linear). */
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

const AREA_FACTORS: Record<string, number> = {
  mm2: 0.000001,
  cm2: 0.0001,
  m2: 1,
  hectare: 10000,
  km2: 1_000_000,
  acre: 4046.8564224,
  sqft: 0.09290304,
  sqmi: 2_589_988.110336,
};

const VOLUME_FACTORS: Record<string, number> = {
  ml: 0.001,
  l: 1,
  m3: 1000,
  gal: 3.785411784,
  qt: 0.946352946,
  cup: 0.2365882365,
  floz: 0.0295735295625,
  tbsp: 0.01478676478125,
};

const SPEED_FACTORS: Record<string, number> = {
  mps: 1,
  kmh: 1 / 3.6,
  mph: 0.44704,
  knot: 0.514444,
  fts: 0.3048,
};

const FACTOR_TABLES: Partial<Record<UnitCategory, Record<string, number>>> = {
  length: LENGTH_FACTORS,
  weight: WEIGHT_FACTORS,
  area: AREA_FACTORS,
  volume: VOLUME_FACTORS,
  speed: SPEED_FACTORS,
};

function convertLinear(value: number, from: string, to: string, factors: Record<string, number>): number | null {
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

const TEMPERATURE_UNITS = ["celsius", "fahrenheit", "kelvin"];

function round(value: number): number {
  return Number(value.toFixed(6));
}

export class UnitConverter extends BaseTool<UnitConverterInput, UnitConverterOutput> {
  metadata = {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Unit Converter",
    category: "converters",
    description: "Convert length, weight, temperature, area, volume, and speed — and see every unit at once.",
    version: "2.0.0",
  };

  execute(input: UnitConverterInput, _context: ToolContext): ToolResult<UnitConverterOutput> {
    const table = FACTOR_TABLES[input.category];

    let result: number | null;
    let allConversions: Record<string, number> = {};

    if (input.category === "temperature") {
      const celsius = toCelsius(input.value, input.from);
      result = celsius === null ? null : fromCelsius(celsius, input.to);
      if (celsius !== null) {
        for (const unit of TEMPERATURE_UNITS) {
          const converted = fromCelsius(celsius, unit);
          if (converted !== null) allConversions[unit] = round(converted);
        }
      }
    } else if (table) {
      result = convertLinear(input.value, input.from, input.to, table);
      if (input.from in table) {
        for (const unit of Object.keys(table)) {
          const converted = convertLinear(input.value, input.from, unit, table);
          if (converted !== null) allConversions[unit] = round(converted);
        }
      }
    } else {
      result = null;
    }

    if (result === null) {
      return {
        success: false,
        data: { value: input.value, result: 0, allConversions: {} },
        metadata: { error: "Unsupported unit for this category" },
      };
    }

    return {
      success: true,
      data: { value: input.value, result: round(result), allConversions },
      metadata: {},
    };
  }
}
