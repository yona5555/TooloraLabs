import { KM_PER_MILE, RIEGEL_FATIGUE_EXPONENT, convertDistanceValue, formatClock, predictFinishTimeSeconds, type DistanceUnit } from "@tooloralabs/tools";

/**
 * Display helpers for the pace visuals (result table, 3D track, eight indicator cards). The
 * calculation itself stays in @tooloralabs/tools; this file only converts units and formats.
 */

/** Effort scale used by this tool since its first version (seconds per km). */
export const PACE_ZONES = [
  { key: "elite", from: 180, to: 240, color: "#ef4444" },
  { key: "fast", from: 240, to: 300, color: "#f59e0b" },
  { key: "moderate", from: 300, to: 390, color: "#22c55e" },
  { key: "easy", from: 390, to: 480, color: "#3b82f6" },
  { key: "recovery", from: 480, to: 720, color: "#a1a1aa" },
] as const;
export type PaceZoneKey = (typeof PACE_ZONES)[number]["key"];

export function zoneOf(secPerKm: number) {
  return PACE_ZONES.find((z) => secPerKm < z.to) ?? PACE_ZONES[PACE_ZONES.length - 1];
}

/** Standard race distances (km) used by the ladders and predictions. */
export const RACES = [
  { key: "mile", km: KM_PER_MILE },
  { key: "5k", km: 5 },
  { key: "10k", km: 10 },
  { key: "15k", km: 15 },
  { key: "half", km: 21.0975 },
  { key: "30k", km: 30 },
  { key: "marathon", km: 42.195 },
] as const;
export const MAIN_RACES = RACES.filter((r) => r.key === "5k" || r.key === "10k" || r.key === "half" || r.key === "marathon");

export const RIEGEL = RIEGEL_FATIGUE_EXPONENT;

/** Converter mode has no distance: the visuals use a 10 km effort at that pace (labelled as assumed). */
export const REF_KM = 10;

export const clock = (s: number) => formatClock(Math.max(0, s));
/** Clock with a sign, e.g. "+1:05" / "−0:30". */
export const sClock = (s: number) => `${s < 0 ? "−" : "+"}${clock(Math.abs(Math.round(s)))}`;

export const toUnit = (km: number, unit: DistanceUnit) => convertDistanceValue(km, "km", unit);
export const toKm = (v: number, unit: DistanceUnit) => convertDistanceValue(v, unit, "km");
/** Seconds per chosen unit from seconds per km. */
export const pacePer = (secPerKm: number, unit: DistanceUnit) => (unit === "km" ? secPerKm : secPerKm * KM_PER_MILE);

/** Riegel prediction in km (T2 = T1 × (D2 / D1)^e), the exponent free for the what-if card. */
export function riegel(knownKm: number, knownSec: number, targetKm: number, exponent = RIEGEL): number {
  if (exponent === RIEGEL) return predictFinishTimeSeconds(knownKm, knownSec, targetKm);
  if (knownKm <= 0 || knownSec <= 0 || targetKm <= 0) return 0;
  return knownSec * Math.pow(targetKm / knownKm, exponent);
}

/** "12:35.36", "1:59:30" or "9.58 s" → seconds (world-record rows from the page's own text). */
export function parseRecord(text: string): number {
  const clean = text.replace(/[^\d:.]/g, "");
  return clean.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

export const n1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
export const n2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2);
