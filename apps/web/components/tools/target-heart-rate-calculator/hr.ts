/**
 * Heart-rate references every visual on this page is drawn from. Pure helpers, no DOM.
 * - Max HR: Fox et al. 1971 (220 − age, the calculator's own estimate), Tanaka et al. 2001
 *   (208 − 0.7 × age), Gellish et al. 2007 (207 − 0.7 × age), Nes et al. 2013 (211 − 0.64 × age),
 *   Gulati et al. 2010, women (206 − 0.88 × age).
 * - Target: straight % of max HR, or Karvonen 1957 (HRR × % + resting).
 * - Five training zones 50–100 % (the calculator's ZONE_RANGES), AHA moderate 50–70 % /
 *   vigorous 70–85 % of max HR, and the ACSM intensity classes (Garber et al. 2011, Table 4).
 */
import type { HeartRateZone } from "./types";

export type ZoneKey = HeartRateZone["key"];

export const ZONES: { key: ZoneKey; lo: number; hi: number; color: string }[] = [
  { key: "veryLight", lo: 50, hi: 60, color: "#0ea5e9" },
  { key: "light", lo: 60, hi: 70, color: "#10b981" },
  { key: "moderate", lo: 70, hi: 80, color: "#f59e0b" },
  { key: "hard", lo: 80, hi: 90, color: "#f97316" },
  { key: "maximum", lo: 90, hi: 100, color: "#ef4444" },
];

/** Colour below zone 1 (under 50 %). */
export const BELOW_COLOR = "#6366f1";

export function zoneIndex(pct: number): number {
  if (pct < 50) return -1;
  const i = ZONES.findIndex((z) => pct < z.hi);
  return i === -1 ? ZONES.length - 1 : i;
}

export const zoneColor = (pct: number) => {
  const i = zoneIndex(pct);
  return i < 0 ? BELOW_COLOR : ZONES[i].color;
};

export type MaxFormulaKey = "fox" | "tanaka" | "gellish" | "nes" | "gulati";

export const MAX_FORMULAS: { key: MaxFormulaKey; a: number; b: number; text: string }[] = [
  { key: "fox", a: 220, b: 1, text: "220 − age" },
  { key: "tanaka", a: 208, b: 0.7, text: "208 − 0.7 × age" },
  { key: "gellish", a: 207, b: 0.7, text: "207 − 0.7 × age" },
  { key: "nes", a: 211, b: 0.64, text: "211 − 0.64 × age" },
  { key: "gulati", a: 206, b: 0.88, text: "206 − 0.88 × age" },
];

export const maxBy = (key: MaxFormulaKey, age: number) => {
  const f = MAX_FORMULAS.find((m) => m.key === key) ?? MAX_FORMULAS[0];
  return f.a - f.b * age;
};

export const fox = (age: number) => 220 - age;
export const tanaka = (age: number) => 208 - 0.7 * age;

/** Target bpm at `pct` % intensity: Karvonen when a resting HR is known, else % of max. */
export function targetAt(pct: number, max: number, rest: number | null): number {
  return rest === null ? (max * pct) / 100 : ((max - rest) * pct) / 100 + rest;
}

/** The intensity (%) that gives `bpm`, inverse of targetAt. */
export function pctAt(bpm: number, max: number, rest: number | null): number {
  return rest === null ? (bpm / max) * 100 : ((bpm - rest) / Math.max(1, max - rest)) * 100;
}

export type AhaKey = "ahaBelow" | "ahaModerate" | "ahaVigorous" | "ahaAbove";
/** American Heart Association target ranges, % of max HR. */
export function ahaOf(pctMax: number): AhaKey {
  if (pctMax < 50) return "ahaBelow";
  if (pctMax < 70) return "ahaModerate";
  if (pctMax <= 85) return "ahaVigorous";
  return "ahaAbove";
}

export type AcsmKey = "veryLight" | "light" | "moderate" | "vigorous" | "nearMax";
/** ACSM intensity classes (Garber et al. 2011, Med Sci Sports Exerc 43:1334, Table 4). */
export const ACSM: { key: AcsmKey; max: [number, number]; hrr: [number, number]; rpe: string; color: string }[] = [
  { key: "veryLight", max: [0, 57], hrr: [0, 30], rpe: "< 9", color: "#6366f1" },
  { key: "light", max: [57, 64], hrr: [30, 40], rpe: "9–11", color: "#0ea5e9" },
  { key: "moderate", max: [64, 77], hrr: [40, 60], rpe: "12–13", color: "#10b981" },
  { key: "vigorous", max: [77, 96], hrr: [60, 90], rpe: "14–17", color: "#f97316" },
  { key: "nearMax", max: [96, 100], hrr: [90, 100], rpe: "≥ 18", color: "#ef4444" },
];

/** Default resting HR used by the Karvonen what-ifs when the user gave none (typical adult). */
export const REST_DEFAULT = 60;

export const r0 = (v: number) => Math.round(v);
