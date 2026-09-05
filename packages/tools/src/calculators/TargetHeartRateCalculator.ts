import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TargetHeartRateInput = {
  age: number;
  restingHeartRate?: number;
};

export type TargetHeartRateError = "invalid-age" | "invalid-resting-heart-rate";

export type HeartRateZone = {
  key: "veryLight" | "light" | "moderate" | "hard" | "maximum";
  lowPercent: number;
  highPercent: number;
  lowBpm: number;
  highBpm: number;
};

export type TargetHeartRateOutput = {
  error: TargetHeartRateError | null;
  maxHeartRate: number;
  restingHeartRate: number | null;
  heartRateReserve: number | null;
  zones: HeartRateZone[];
};

const ZONE_RANGES: { key: HeartRateZone["key"]; low: number; high: number }[] = [
  { key: "veryLight", low: 0.5, high: 0.6 },
  { key: "light", low: 0.6, high: 0.7 },
  { key: "moderate", low: 0.7, high: 0.8 },
  { key: "hard", low: 0.8, high: 0.9 },
  { key: "maximum", low: 0.9, high: 1.0 },
];

/**
 * Uses the Karvonen (heart rate reserve) method when a resting heart rate is supplied —
 * target = ((max - resting) * intensity%) + resting — which accounts for individual fitness
 * level, and falls back to the simpler straight percentage of max heart rate otherwise.
 */
function computeZone(maxHeartRate: number, restingHeartRate: number | null, low: number, high: number): { lowBpm: number; highBpm: number } {
  if (restingHeartRate === null) {
    return { lowBpm: maxHeartRate * low, highBpm: maxHeartRate * high };
  }
  const reserve = maxHeartRate - restingHeartRate;
  return { lowBpm: reserve * low + restingHeartRate, highBpm: reserve * high + restingHeartRate };
}

/**
 * Estimates maximum heart rate via the classic "220 minus age" formula (Fox et al., 1971) —
 * still the most widely cited estimate despite known imprecision for any single individual —
 * then derives five standard training-intensity zones from it.
 */
export class TargetHeartRateCalculator extends BaseCalculator<TargetHeartRateInput, TargetHeartRateOutput> {
  metadata = {
    id: "target-heart-rate-calculator",
    slug: "target-heart-rate-calculator",
    name: "Target Heart Rate Calculator",
    category: "health-fitness",
    description: "Calculate your maximum heart rate and target training zones from your age, optionally refined with your resting heart rate.",
    version: "1.0.0",
  };

  execute(input: TargetHeartRateInput, _context: ToolContext): ToolResult<TargetHeartRateOutput> {
    const { age, restingHeartRate } = input;

    if (!Number.isFinite(age) || age <= 0 || age > 120) {
      return this.error("invalid-age");
    }
    if (restingHeartRate !== undefined && (!Number.isFinite(restingHeartRate) || restingHeartRate <= 0 || restingHeartRate > 220)) {
      return this.error("invalid-resting-heart-rate");
    }

    const maxHeartRate = 220 - age;
    const resting = restingHeartRate ?? null;
    const heartRateReserve = resting !== null ? maxHeartRate - resting : null;

    const zones: HeartRateZone[] = ZONE_RANGES.map(({ key, low, high }) => {
      const { lowBpm, highBpm } = computeZone(maxHeartRate, resting, low, high);
      return { key, lowPercent: low * 100, highPercent: high * 100, lowBpm, highBpm };
    });

    return {
      success: true,
      data: { error: null, maxHeartRate, restingHeartRate: resting, heartRateReserve, zones },
      metadata: {},
    };
  }

  private error(error: TargetHeartRateError): ToolResult<TargetHeartRateOutput> {
    return { success: true, data: { error, maxHeartRate: 0, restingHeartRate: null, heartRateReserve: null, zones: [] }, metadata: {} };
  }
}
