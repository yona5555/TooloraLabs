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
