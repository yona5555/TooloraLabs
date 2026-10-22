/**
 * Energy references every TDEE visual on this page is drawn from. Pure helpers, no DOM.
 * - BMR: Mifflin-St Jeor 1990 (the calculator's default), Katch-McArdle (370 + 21.6 × LBM, when
 *   body fat is known), Harris-Benedict revised by Roza & Shizgal 1984, Cunningham 1980
 *   (500 + 22 × LBM). Body fat for the lean-mass formulas, when not given: Deurenberg 1991
 *   (1.2 × BMI + 0.23 × age − 10.8 × sex − 5.4, sex = 1 for men).
 * - TDEE = BMR × the calculator's own ACTIVITY_MULTIPLIERS (imported, never retyped).
 * - Split of TDEE: TEF = 10 % of TDEE (Westerterp 2004); NEAT = the activity energy of the
 *   sedentary level (1.2 × BMR × 0.9 − BMR); EAT = everything the chosen level adds above it.
 * - 7700 kcal per kg of body weight change (the calculator's KCAL_PER_KG_BODY_FAT); the 35 %
 *   "aggressive" line is the calculator's own isAggressive threshold.
 */
import { ACTIVITY_MULTIPLIERS, KCAL_PER_KG_BODY_FAT, type ActivityLevel, type Gender } from "@tooloralabs/tools";

export const LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "veryActive"];
export const KCAL_KG = KCAL_PER_KG_BODY_FAT;
export const mult = (level: ActivityLevel) => ACTIVITY_MULTIPLIERS[level];

export const COLORS = { bmr: "#3b82f6", tef: "#10b981", neat: "#f59e0b", eat: "#f97316", intake: "#8b5cf6" };
export const LEVEL_COLORS: Record<ActivityLevel, string> = {
  sedentary: "#64748b",
  light: "#0ea5e9",
  moderate: "#10b981",
  active: "#f59e0b",
  veryActive: "#ef4444",
};

/** Default thermic effect of food, share of TDEE. */
export const TEF_SHARE = 0.1;

export type Split = { bmr: number; tef: number; neat: number; eat: number; total: number };

/** BMR + TEF + NEAT + EAT for one TDEE; the four parts always add up to `tdee`. */
export function splitOf(bmr: number, tdee: number, tefShare = TEF_SHARE): Split {
  const tef = tdee * tefShare;
  const activity = Math.max(0, tdee - tef - bmr);
  const neat = Math.min(activity, Math.max(0, bmr * ACTIVITY_MULTIPLIERS.sedentary * (1 - tefShare) - bmr));
  return { bmr, tef, neat, eat: activity - neat, total: tdee };
}

export type GaugeKey = "aggressiveDeficit" | "moderateDeficit" | "maintenance" | "moderateSurplus" | "aggressiveSurplus";
/** Daily adjustment as a signed % of TDEE, in the zones of the old energy gauge (±10, ±35). */
export const GAUGE_ZONES: { key: GaugeKey; from: number; to: number; color: string }[] = [
  { key: "aggressiveDeficit", from: -50, to: -35, color: "#ef4444" },
  { key: "moderateDeficit", from: -35, to: -10, color: "#f59e0b" },
  { key: "maintenance", from: -10, to: 10, color: "#22c55e" },
  { key: "moderateSurplus", from: 10, to: 35, color: "#0ea5e9" },
  { key: "aggressiveSurplus", from: 35, to: 50, color: "#a855f7" },
];
export function gaugeZone(pct: number) {
  return GAUGE_ZONES.find((z) => pct < z.to) ?? GAUGE_ZONES[GAUGE_ZONES.length - 1];
}

/** Daily kcal adjustment for a signed weekly change in kg. */
export const dailyFromWeekly = (kgPerWeek: number) => (kgPerWeek * KCAL_KG) / 7;
export const weeklyFromDaily = (kcalPerDay: number) => (kcalPerDay * 7) / KCAL_KG;

/** Deurenberg 1991 body-fat estimate (%) from BMI, age and sex. */
export function deurenberg(bmi: number, age: number, gender: Gender): number {
  return 1.2 * bmi + 0.23 * age - 10.8 * (gender === "male" ? 1 : 0) - 5.4;
}

export type BmrFormulaKey = "mifflin" | "harris" | "katch" | "cunningham";
export const BMR_FORMULAS: { key: BmrFormulaKey; text: string }[] = [
  { key: "mifflin", text: "10W + 6.25H − 5A + s" },
  { key: "harris", text: "Harris-Benedict (1984)" },
  { key: "katch", text: "370 + 21.6 × LBM" },
  { key: "cunningham", text: "500 + 22 × LBM" },
];

export function mifflin(w: number, h: number, a: number, g: Gender): number {
  return 10 * w + 6.25 * h - 5 * a + (g === "male" ? 5 : -161);
}
export function harris(w: number, h: number, a: number, g: Gender): number {
  return g === "male" ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
}
export function bmrBy(key: BmrFormulaKey, w: number, h: number, a: number, g: Gender, bf: number): number {
  const lbm = w * (1 - bf / 100);
  if (key === "harris") return harris(w, h, a, g);
  if (key === "katch") return 370 + 21.6 * lbm;
  if (key === "cunningham") return 500 + 22 * lbm;
  return mifflin(w, h, a, g);
}

/** Western-digit integer with thousands separators (indicator cards). */
export const k0 = (v: number) => Math.round(v).toLocaleString("en-US");
export const kcalT = (v: number) => `${k0(v)} kcal`;
export const sgn = (v: number, s: string) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${s}`;
