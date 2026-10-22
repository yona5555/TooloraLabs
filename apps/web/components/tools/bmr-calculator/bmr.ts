import { BMRCalculator as BMRTool, type BMRFormula, type Gender } from "@tooloralabs/tools";
import { bandForBmr, type BMRRangeBand } from "./types";

/**
 * Display helpers for the BMR visuals. The two BMR values always come from the tool itself
 * (packages/tools, formula "compare"); the coefficients below are the same published equations,
 * used only to write the terms out and to solve them backwards (the weight or age that gives a
 * BMR) for the drawings. Katch-McArdle, Cunningham, Deurenberg, the organ shares and the PAL
 * factors are standard reference values used by the comparison cards only.
 */
const tool = new BMRTool();

export type Body = { gender: Gender; weightKg: number; heightCm: number; age: number };
export type Which = "hb" | "msj";

/** Both estimates from the tool; null when the measurements are invalid. */
export function bmrPair(b: Body): { hb: number; msj: number } | null {
  const d = tool.execute({ ...b, formula: "compare" }, { locale: "en-US" }).data;
  if (d.error || d.harrisBenedict === null || d.mifflinStJeor === null) return null;
  return { hb: d.harrisBenedict, msj: d.mifflinStJeor };
}

/** One estimate from the tool, 0 when out of range (drawings only). */
export function bmrAt(b: Body, which: Which): number {
  const p = bmrPair(b);
  return p ? p[which] : 0;
}

/** The formula the Result headline follows (the tool's single value: Harris-Benedict unless Mifflin-St Jeor alone is chosen). */
export const whichOf = (formula: BMRFormula): Which => (formula === "mifflinStJeor" ? "msj" : "hb");

/** BMR = c + w·kg + h·cm − a·age. */
export type Coef = { c: number; w: number; h: number; a: number };
export function coefOf(which: Which, g: Gender): Coef {
  if (which === "msj") return { c: g === "male" ? 5 : -161, w: 10, h: 6.25, a: 5 };
  return g === "male" ? { c: 66.473, w: 13.7516, h: 5.0033, a: 6.755 } : { c: 655.0955, w: 9.5634, h: 1.8496, a: 4.6756 };
}

/** The weight (kg) that gives `bmr` for this height, age and sex. */
export function weightForBmr(b: Body, bmr: number, which: Which): number {
  const k = coefOf(which, b.gender);
  return (bmr - k.c - k.h * b.heightCm + k.a * b.age) / k.w;
}

/** The age that gives `bmr` for this weight, height and sex. */
export function ageForBmr(b: Body, bmr: number, which: Which): number {
  const k = coefOf(which, b.gender);
  return (k.c + k.w * b.weightKg + k.h * b.heightCm - bmr) / k.a;
}

export const DOMAIN: [number, number] = [800, 3000];
export const CUTS = [1400, 2000];
export type Band = { key: BMRRangeBand; min: number; max: number; color: string };
export const BANDS: Band[] = [
  { key: "lower", min: DOMAIN[0], max: 1400, color: "#0ea5e9" },
  { key: "typical", min: 1400, max: 2000, color: "#3b82f6" },
  { key: "higher", min: 2000, max: DOMAIN[1], color: "#6366f1" },
];
export const bandOf = (bmr: number): Band => BANDS.find((x) => x.key === bandForBmr(bmr))!;

export const bmiOf = (b: Body) => b.weightKg / (b.heightCm / 100) ** 2;

/** Deurenberg (1991) body-fat estimate from BMI, age and sex, the seed for the lean-mass equations. */
export const deurenberg = (b: Body) => 1.2 * bmiOf(b) + 0.23 * b.age - 10.8 * (b.gender === "male" ? 1 : 0) - 5.4;
export const katchMcArdle = (lbm: number) => 370 + 21.6 * lbm;
export const cunningham = (lbm: number) => 500 + 22 * lbm;

/** Share of resting energy by organ for a reference adult (Elia, 1992). */
export const ORGANS = [
  { key: "liver", share: 0.21, color: "#b45309" },
  { key: "brain", share: 0.2, color: "#db2777" },
  { key: "muscle", share: 0.22, color: "#dc2626" },
  { key: "heart", share: 0.09, color: "#7c3aed" },
  { key: "kidneys", share: 0.08, color: "#0891b2" },
  { key: "adipose", share: 0.04, color: "#ca8a04" },
  { key: "other", share: 0.16, color: "#64748b" },
] as const;

/** Physical-activity-level multipliers (Harris-Benedict activity factors). */
export const PAL = [
  { key: "sedentary", f: 1.2 },
  { key: "light", f: 1.375 },
  { key: "moderate", f: 1.55 },
  { key: "active", f: 1.725 },
  { key: "veryActive", f: 1.9 },
] as const;

/** Whole kcal with Western digits and thousands separators (indicator cards). */
export const k0 = (v: number) => Math.round(v).toLocaleString("en-US");
