import type { CircleKnownField } from "@tooloralabs/tools";
export type { CircleKnownField, CircleCalculatorOutput as CircleResult } from "@tooloralabs/tools";

export const CIRCLE_KNOWN_FIELDS = ["radius", "diameter", "circumference", "area"] as const;

export type CircleScenario = { key: string; knownField: CircleKnownField; value: string };

/** Real, everyday circle examples spanning each known-field mode. */
export const CIRCLE_SCENARIOS: CircleScenario[] = [
  { key: "bicycleWheel", knownField: "radius", value: "33" },
  { key: "pizzaDiameter", knownField: "diameter", value: "30" },
  { key: "trackLap", knownField: "circumference", value: "400" },
  { key: "roomFloor", knownField: "area", value: "12.6" },
];
