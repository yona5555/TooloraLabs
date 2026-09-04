export type DistanceUnit = "km" | "mi";

/** IAAF/World Athletics standard: 1 mile = 1.609344 km exactly. */
export const KM_PER_MILE = 1.609344;

export function convertDistanceValue(value: number, from: DistanceUnit, to: DistanceUnit): number {
  if (from === to) return value;
  return from === "mi" ? value * KM_PER_MILE : value / KM_PER_MILE;
}

/** Converts a pace expressed as seconds-per-`from`-unit into seconds-per-`to`-unit, at the same speed. */
export function convertPaceSeconds(paceSecondsPerUnit: number, from: DistanceUnit, to: DistanceUnit): number {
  if (from === to) return paceSecondsPerUnit;
  return from === "mi" ? paceSecondsPerUnit / KM_PER_MILE : paceSecondsPerUnit * KM_PER_MILE;
}

export function secondsFromParts(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export type ClockParts = { hours: number; minutes: number; seconds: number };

export function partsFromSeconds(totalSeconds: number): ClockParts {
  const rounded = Math.max(0, Math.round(totalSeconds));
  return {
    hours: Math.floor(rounded / 3600),
    minutes: Math.floor((rounded % 3600) / 60),
    seconds: rounded % 60,
  };
}

/** "h:mm:ss" once an hour is reached, "m:ss" below it — matches how race times and paces are conventionally displayed. */
export function formatClock(totalSeconds: number): string {
  const { hours, minutes, seconds } = partsFromSeconds(totalSeconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export type RacePreset = "5k" | "10k" | "half-marathon" | "marathon";

export const RACE_PRESET_DISTANCE_KM: Record<RacePreset, number> = {
  "5k": 5,
  "10k": 10,
  "half-marathon": 21.0975,
  marathon: 42.195,
};

export type PaceCalcResult = {
  valid: boolean;
  distance: number;
  distanceUnit: DistanceUnit;
  timeSeconds: number;
  paceSecondsPerKm: number;
  paceSecondsPerMi: number;
  speedKmh: number;
  speedMph: number;
};

const INVALID_RESULT: PaceCalcResult = {
  valid: false,
  distance: 0,
  distanceUnit: "km",
  timeSeconds: 0,
  paceSecondsPerKm: 0,
  paceSecondsPerMi: 0,
  speedKmh: 0,
  speedMph: 0,
};

function buildResult(distance: number, distanceUnit: DistanceUnit, timeSeconds: number, paceSecondsPerUnit: number): PaceCalcResult {
  const paceSecondsPerKm = distanceUnit === "km" ? paceSecondsPerUnit : convertPaceSeconds(paceSecondsPerUnit, "mi", "km");
  const paceSecondsPerMi = distanceUnit === "mi" ? paceSecondsPerUnit : convertPaceSeconds(paceSecondsPerUnit, "km", "mi");
  return {
    valid: true,
    distance,
    distanceUnit,
    timeSeconds,
    paceSecondsPerKm,
    paceSecondsPerMi,
    speedKmh: paceSecondsPerKm > 0 ? 3600 / paceSecondsPerKm : 0,
    speedMph: paceSecondsPerMi > 0 ? 3600 / paceSecondsPerMi : 0,
  };
}

function isPositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

function isNonNegative(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

export function solvePaceFromDistanceAndTime(distance: number, distanceUnit: DistanceUnit, timeSeconds: number): PaceCalcResult {
  if (!isPositive(distance) || !isPositive(timeSeconds)) return INVALID_RESULT;
  return buildResult(distance, distanceUnit, timeSeconds, timeSeconds / distance);
}

export function solveTimeFromDistanceAndPace(distance: number, distanceUnit: DistanceUnit, paceSecondsPerUnit: number): PaceCalcResult {
  if (!isPositive(distance) || !isPositive(paceSecondsPerUnit)) return INVALID_RESULT;
  return buildResult(distance, distanceUnit, distance * paceSecondsPerUnit, paceSecondsPerUnit);
}

export function solveDistanceFromTimeAndPace(timeSeconds: number, distanceUnit: DistanceUnit, paceSecondsPerUnit: number): PaceCalcResult {
  if (!isPositive(timeSeconds) || !isPositive(paceSecondsPerUnit)) return INVALID_RESULT;
  return buildResult(timeSeconds / paceSecondsPerUnit, distanceUnit, timeSeconds, paceSecondsPerUnit);
}

export type MultipointEntry = {
  distance: number;
  distanceUnit: DistanceUnit;
  timeSeconds: number;
};

export type MultipointSegment = {
  fromIndex: number;
  toIndex: number;
  segmentDistance: number;
  segmentTimeSeconds: number;
  paceSecondsPerUnit: number;
  speedPerHour: number;
};

/**
 * Points are cumulative splits (each point's distance/time measured from the very start), the
 * way a runner logs mile/km markers during one continuous effort — not independent laps. Only
 * consecutive pairs where both points parsed to positive, increasing distance and time produce a
 * segment; a single malformed row breaks the chain at that point without discarding valid
 * segments on either side of it.
 */
export function calculateMultipointSegments(points: MultipointEntry[]): MultipointSegment[] {
  const segments: MultipointSegment[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!isNonNegative(prev.distance) || !isNonNegative(prev.timeSeconds) || !isNonNegative(curr.distance) || !isNonNegative(curr.timeSeconds)) continue;

    const prevDistanceKm = convertDistanceValue(prev.distance, prev.distanceUnit, "km");
    const currDistanceKm = convertDistanceValue(curr.distance, curr.distanceUnit, "km");
    const segmentDistance = currDistanceKm - prevDistanceKm;
    const segmentTimeSeconds = curr.timeSeconds - prev.timeSeconds;
    if (segmentDistance <= 0 || segmentTimeSeconds <= 0) continue;

    const paceSecondsPerUnit = segmentTimeSeconds / segmentDistance;
    segments.push({
      fromIndex: i - 1,
      toIndex: i,
      segmentDistance,
      segmentTimeSeconds,
      paceSecondsPerUnit,
      speedPerHour: 3600 / paceSecondsPerUnit,
    });
  }
  return segments;
}

/**
 * Peter Riegel's race-time prediction formula (Runner's World, 1977; formalized in "Athletic
 * Records and Human Endurance", American Scientist, 1981): T2 = T1 * (D2/D1)^1.06. The 1.06
 * exponent (rather than 1.0, a naive linear scaling) accounts for endurance fatigue — pace
 * predictably slows as distance grows, so doubling the distance roughly doubles-plus-6% the time.
 * Distances only need to share a unit; the ratio is unitless.
 */
export const RIEGEL_FATIGUE_EXPONENT = 1.06;

export function predictFinishTimeSeconds(knownDistance: number, knownTimeSeconds: number, targetDistance: number): number {
  if (!isPositive(knownDistance) || !isPositive(knownTimeSeconds) || !isPositive(targetDistance)) return 0;
  return knownTimeSeconds * Math.pow(targetDistance / knownDistance, RIEGEL_FATIGUE_EXPONENT);
}
