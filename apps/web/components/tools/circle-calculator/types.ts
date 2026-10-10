import type { CircleKnownField } from "@tooloralabs/tools";
export type { CircleKnownField, CircleCalculatorOutput as CircleResult } from "@tooloralabs/tools";

export const CIRCLE_KNOWN_FIELDS = ["radius", "diameter", "circumference", "area"] as const;

export type CircleScenario = { key: string; knownField: CircleKnownField; value: string; detail: string };

/**
 * Real, everyday circles spanning each known-field mode (published sizes: US quarter 24.26 mm,
 * audio CD 120 mm, 700C road tyre ≈ 33 cm radius, 400 m running-track lap, London Eye 120 m).
 */
export const CIRCLE_SCENARIOS: CircleScenario[] = [
  { key: "coin", knownField: "diameter", value: "2.426", detail: "d = 2.426 cm" },
  { key: "compactDisc", knownField: "diameter", value: "12", detail: "d = 12 cm" },
  { key: "pizzaDiameter", knownField: "diameter", value: "30", detail: "d = 30 cm" },
  { key: "bicycleWheel", knownField: "radius", value: "33", detail: "r = 33 cm" },
  { key: "roomFloor", knownField: "area", value: "12.6", detail: "A = 12.6 m²" },
  { key: "trackLap", knownField: "circumference", value: "400", detail: "C = 400 m" },
  { key: "ferrisWheel", knownField: "diameter", value: "120", detail: "d = 120 m" },
];
