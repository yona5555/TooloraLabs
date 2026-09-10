export type { StandardDeviationOutput as StandardDeviationResult, DeviationRow } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

export function parseDataSet(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => parseLocalizedNumber(token))
    .filter((value) => !Number.isNaN(value));
}

export type StandardDeviationScenario = { key: string; rawData: string };

export const STANDARD_DEVIATION_SCENARIOS: StandardDeviationScenario[] = [
  { key: "testScores", rawData: "72, 85, 90, 85, 60, 95" },
  { key: "dailyTemperatures", rawData: "68, 70, 65, 72, 71, 69, 73" },
  { key: "factoryMeasurements", rawData: "10.02, 9.98, 10.01, 9.99, 10.00, 10.03, 9.97" },
];
