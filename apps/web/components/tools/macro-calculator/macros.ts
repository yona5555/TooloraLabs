/**
 * Nutrition references every macro visual on this page is drawn from. Pure helpers, no DOM.
 * - Grams from calories: Atwater factors, 4 kcal/g protein and carbohydrate, 9 kcal/g fat (the
 *   calculator's own factors). The goal splits come from the calculator itself (executed per goal,
 *   never retyped).
 * - AMDR (Institute of Medicine 2005): protein 10–35 %, carbohydrate 45–65 %, fat 20–35 % of kcal.
 * - Protein per kg of body weight: RDA 0.8 g/kg (IOM 2005); ISSN position stand 2017 1.4–2.0 g/kg
 *   for exercising adults; up to 2.3–3.1 g/kg of lean mass for lean athletes in a deficit
 *   (Helms et al. 2014). Per meal: ISSN 0.25–0.4 g/kg (about 20–40 g).
 * - The calculator has no body-weight input: protein-per-kg views use a 70 kg reference body
 *   (assumed, labelled) that the visitor can change on the card.
 * - Food protein per 100 g: approximate USDA FoodData Central values (cooked/ready to eat).
 */
import { MacroCalculator, type MacroBreakdown, type MacroGoal } from "@tooloralabs/tools";

const tool = new MacroCalculator();

export const MACROS = ["protein", "carbs", "fat"] as const;
export type MacroKey = (typeof MACROS)[number];
export const GOALS: MacroGoal[] = ["lose", "maintain", "gain", "buildMuscle"];

export const KCAL_G: Record<MacroKey, number> = { protein: 4, carbs: 4, fat: 9 };
export const COLORS: Record<MacroKey, string> = { protein: "#3b82f6", carbs: "#10b981", fat: "#f59e0b" };
export const SYMBOL: Record<MacroKey, string> = { protein: "P", carbs: "C", fat: "F" };
export const GOAL_COLORS: Record<MacroGoal, string> = { lose: "#ef4444", maintain: "#10b981", gain: "#0ea5e9", buildMuscle: "#8b5cf6" };

export const AMDR: Record<MacroKey, [number, number]> = { protein: [10, 35], carbs: [45, 65], fat: [20, 35] };

export type MacroSplit = Record<MacroKey, MacroBreakdown>;

/** The calculator's own split for a calorie total and goal (null when the total is invalid). */
export function splitFor(kcal: number, goal: MacroGoal): MacroSplit | null {
  const out = tool.execute({ totalCalories: kcal, goal }, { locale: "en-US" }).data;
  if (!out || out.error) return null;
  return { protein: out.protein, carbs: out.carbs, fat: out.fat };
}

/** Grams of one macro from calories and its share (percent). */
export const gramsOf = (key: MacroKey, kcal: number, pct: number) => (kcal * pct) / 100 / KCAL_G[key];

export const inAmdr = (key: MacroKey, pct: number) => pct >= AMDR[key][0] - 1e-9 && pct <= AMDR[key][1] + 1e-9;

export const REF_WEIGHT_KG = 70;

export type ProteinZoneKey = "belowRda" | "general" | "active" | "high" | "veryHigh";
/** Protein g/kg bands (RDA, ISSN, Helms 2014). */
export const PROTEIN_ZONES: { key: ProteinZoneKey; from: number; to: number; color: string }[] = [
  { key: "belowRda", from: 0, to: 0.8, color: "#ef4444" },
  { key: "general", from: 0.8, to: 1.4, color: "#f59e0b" },
  { key: "active", from: 1.4, to: 2.0, color: "#22c55e" },
  { key: "high", from: 2.0, to: 3.1, color: "#0ea5e9" },
  { key: "veryHigh", from: 3.1, to: 4, color: "#a855f7" },
];
export const proteinZone = (gkg: number) => PROTEIN_ZONES.find((z) => gkg < z.to) ?? PROTEIN_ZONES[PROTEIN_ZONES.length - 1];

export type FoodKey = "chicken" | "tuna" | "tofu" | "eggs" | "yogurt" | "lentils";
/** Protein grams per 100 g, approximate USDA FoodData Central values. */
export const FOODS: { key: FoodKey; per100: number }[] = [
  { key: "chicken", per100: 31 },
  { key: "tuna", per100: 26 },
  { key: "tofu", per100: 17 },
  { key: "eggs", per100: 13 },
  { key: "yogurt", per100: 10 },
  { key: "lentils", per100: 9 },
];

/** Western-digit integer with thousands separators (indicator cards). */
export const k0 = (v: number) => Math.round(v).toLocaleString("en-US");
export const kcalT = (v: number) => `${k0(v)} kcal`;
export const gT = (v: number) => `${k0(v)} g`;
export const sgn = (v: number, s: string) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${s}`;
