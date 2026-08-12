import type { UnitCategory } from "@tooloralabs/tools";

export const UNIT_CATEGORIES: UnitCategory[] = ["length", "weight", "temperature", "area", "volume", "speed"];

export const UNITS_BY_CATEGORY: Record<UnitCategory, string[]> = {
  length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  weight: ["mg", "g", "kg", "t", "oz", "lb"],
  temperature: ["celsius", "fahrenheit", "kelvin"],
  area: ["mm2", "cm2", "m2", "hectare", "km2", "acre", "sqft", "sqmi"],
  volume: ["ml", "l", "m3", "gal", "qt", "cup", "floz", "tbsp"],
  speed: ["mps", "kmh", "mph", "knot", "fts"],
};

export const DEFAULT_UNIT: Record<UnitCategory, [string, string]> = {
  length: ["m", "ft"],
  weight: ["kg", "lb"],
  temperature: ["celsius", "fahrenheit"],
  area: ["m2", "sqft"],
  volume: ["l", "gal"],
  speed: ["kmh", "mph"],
};
