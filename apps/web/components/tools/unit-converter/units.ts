import type { UnitCategory } from "@tooloralabs/tools";

export const UNIT_CATEGORIES: UnitCategory[] = ["length", "weight", "temperature"];

export const UNITS_BY_CATEGORY: Record<UnitCategory, string[]> = {
  length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  weight: ["mg", "g", "kg", "t", "oz", "lb"],
  temperature: ["celsius", "fahrenheit", "kelvin"],
};

export const DEFAULT_UNIT: Record<UnitCategory, [string, string]> = {
  length: ["m", "ft"],
  weight: ["kg", "lb"],
  temperature: ["celsius", "fahrenheit"],
};
