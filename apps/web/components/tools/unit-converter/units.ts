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

/** Printed unit symbols (exact case, §44): the scene, legend and card labels use these. */
export const UNIT_SYMBOL: Record<string, string> = {
  mm: "mm", cm: "cm", m: "m", km: "km", in: "in", ft: "ft", yd: "yd", mi: "mi",
  mg: "mg", g: "g", kg: "kg", t: "t", oz: "oz", lb: "lb",
  celsius: "°C", fahrenheit: "°F", kelvin: "K",
  mm2: "mm²", cm2: "cm²", m2: "m²", hectare: "ha", km2: "km²", acre: "ac", sqft: "ft²", sqmi: "mi²",
  ml: "mL", l: "L", m3: "m³", gal: "gal", qt: "qt", cup: "cup", floz: "fl oz", tbsp: "tbsp",
  mps: "m/s", kmh: "km/h", mph: "mph", knot: "kn", fts: "ft/s",
};

/** The calculator's own default value (the Result scene's reset returns to it). */
export const DEFAULT_VALUE = 10;

/**
 * Scale of the Result scene in the "from" unit: a fixed base range per category (temperature per
 * scale, so it always shows freezing and boiling water), widened to the next nice number when a
 * typed value goes past it.
 */
export function sceneBase(category: UnitCategory, from: string): [number, number] {
  if (category === "temperature") return from === "kelvin" ? [0, 400] : from === "fahrenheit" ? [-60, 300] : [-50, 150];
  return category === "speed" ? [0, 200] : [0, 100];
}
