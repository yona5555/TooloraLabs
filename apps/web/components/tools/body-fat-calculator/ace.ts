/**
 * Reference values every body-fat visual on this page is drawn from. Pure helpers, no DOM.
 * - ACE body-fat categories (American Council on Exercise, "Percent Body Fat Norms"):
 *   men essential 2–5 %, athletes 6–13 %, fitness 14–17 %, average 18–24 %, obese ≥ 25 %;
 *   women 10–13 %, 14–20 %, 21–24 %, 25–31 %, ≥ 32 %. The upper bounds match the tool's own
 *   categorize() in @tooloralabs/tools.
 * - ACSM healthy range (ACSM's Guidelines for Exercise Testing and Prescription): men 10–22 %,
 *   women 20–32 %.
 * - U.S. Navy circumference method (Hodgdon & Beckett, 1984), solved for the waist so the cards
 *   can show the tape reading that lands on each ACE cut-off.
 */
import { BodyFatCalculator as BodyFatTool, type BodyFatCategory, type Gender } from "@tooloralabs/tools";

export type AceClass = { key: BodyFatCategory; min: number; max: number; color: string };

const COLORS: Record<BodyFatCategory, string> = {
  essential: "#6366f1",
  athletes: "#0ea5e9",
  fitness: "#10b981",
  average: "#f59e0b",
  obese: "#ef4444",
};

const CUTS: Record<Gender, number[]> = { male: [5, 13, 17, 24], female: [13, 20, 24, 31] };

/** Drawing domain per sex (percent), wide enough for every realistic Navy estimate. */
export const DOMAIN: Record<Gender, [number, number]> = { male: [0, 40], female: [6, 48] };

/** ACE essential fat used for the composition split (mid of 2–5 % and 10–13 %). */
export const ESSENTIAL: Record<Gender, number> = { male: 3, female: 12 };

/** ACSM healthy range. */
export const ACSM: Record<Gender, [number, number]> = { male: [10, 22], female: [20, 32] };

export const aceCuts = (g: Gender) => CUTS[g];

export function aceClasses(g: Gender): AceClass[] {
  const c = CUTS[g];
  const keys: BodyFatCategory[] = ["essential", "athletes", "fitness", "average", "obese"];
  return keys.map((key, i) => ({ key, min: i === 0 ? 0 : c[i - 1], max: i < 4 ? c[i] : Infinity, color: COLORS[key] }));
}

export function aceOf(g: Gender, bf: number): AceClass {
  const list = aceClasses(g);
  return list.find((c) => bf <= c.max) ?? list[list.length - 1];
}

export const aceColor = (k: BodyFatCategory) => COLORS[k];

export type Measures = { gender: Gender; heightCm: number; neckCm: number; waistCm: number; hipCm: number };

const tool = new BodyFatTool();

/** Body fat % from the tool itself (same formula as the Result), or null when the tape is invalid. */
export function navyBf(m: Measures): number | null {
  const out = tool.execute(
    { gender: m.gender, heightCm: m.heightCm, neckCm: m.neckCm, waistCm: m.waistCm, hipCm: m.gender === "female" ? m.hipCm : undefined },
    { locale: "en-US" },
  ).data;
  return out.error ? null : out.bodyFatPercent;
}

export const IN = 2.54;
const log10 = Math.log10;

/** The waist (cm) that gives `bf` % for these other measurements (Navy formula solved for waist). */
export function waistFor(m: Measures, bf: number): number {
  const hIn = m.heightCm / IN;
  const nIn = m.neckCm / IN;
  if (m.gender === "male") return (nIn + 10 ** ((bf - 36.76 + 70.041 * log10(hIn)) / 86.01)) * IN;
  return (10 ** ((bf + 78.387 + 97.684 * log10(hIn)) / 163.205) - m.hipCm / IN + nIn) * IN;
}

/** The circumference term inside the log: waist − neck (men) or waist + hip − neck (women), inches. */
export function circIn(m: Measures): number {
  return (m.gender === "male" ? m.waistCm - m.neckCm : m.waistCm + m.hipCm - m.neckCm) / IN;
}

/** Lean mass (kg) stays fixed when only fat changes: weight at a target body-fat %. */
export const weightAtBf = (weightKg: number, bf: number, target: number) => (weightKg * (1 - bf / 100)) / (1 - target / 100);
