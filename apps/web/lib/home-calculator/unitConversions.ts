export type UnitCategory = "length" | "weight" | "temperature" | "volume";

/** Linear categories (length/weight/volume) store each unit's factor relative to the category's base unit — converting is then just (value * fromFactor) / toFactor. Temperature isn't linear (a 0-offset multiply can't turn Celsius into Fahrenheit), so it's handled separately below via toBaseCelsius/fromBaseCelsius. */
export const LINEAR_UNITS: Record<Exclude<UnitCategory, "temperature">, Record<string, number>> = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
  },
  weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.45359237,
    oz: 0.028349523125,
  },
  volume: {
    L: 1,
    mL: 0.001,
    gal: 3.785411784,
    qt: 0.946352946,
    cup: 0.2365882365,
  },
};

export const TEMPERATURE_UNITS = ["C", "F", "K"] as const;
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

function toBaseCelsius(value: number, unit: TemperatureUnit): number {
  switch (unit) {
    case "C":
      return value;
    case "F":
      return ((value - 32) * 5) / 9;
    case "K":
      return value - 273.15;
  }
}

function fromBaseCelsius(celsius: number, unit: TemperatureUnit): number {
  switch (unit) {
    case "C":
      return celsius;
    case "F":
      return (celsius * 9) / 5 + 32;
    case "K":
      return celsius + 273.15;
  }
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  return fromBaseCelsius(toBaseCelsius(value, from), to);
}

export function convertLinear(value: number, category: Exclude<UnitCategory, "temperature">, from: string, to: string): number {
  const units = LINEAR_UNITS[category];
  return (value * units[from]) / units[to];
}

export function convert(value: number, category: UnitCategory, from: string, to: string): number {
  if (category === "temperature") {
    return convertTemperature(value, from as TemperatureUnit, to as TemperatureUnit);
  }
  return convertLinear(value, category, from, to);
}

export function unitsForCategory(category: UnitCategory): string[] {
  return category === "temperature" ? [...TEMPERATURE_UNITS] : Object.keys(LINEAR_UNITS[category]);
}
