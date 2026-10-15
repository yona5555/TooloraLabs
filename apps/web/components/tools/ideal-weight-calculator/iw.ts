import { calculateIdealWeight, type Gender, type IdealWeightResult } from "@tooloralabs/tools";
import { bmiOf, weightAt, WHO_CLASSES } from "../bmi-calculator/who";

/**
 * Display helpers for the ideal-weight visuals. Every estimate comes from the tool itself
 * (packages/tools calculateIdealWeight); the coefficients below are the same published formulas
 * (Devine 1974, Robinson 1983, Miller 1983, Hamwi 1964), used only to write the terms out. The
 * healthy range is the WHO adult BMI band 18.5–24.9 (WHO TRS 894, 2000), reused from the BMI tool.
 */
export type FormulaKey = "devine" | "robinson" | "miller" | "hamwi";
export const FORMULAS: { key: FormulaKey; label: string; color: string }[] = [
  { key: "devine", label: "devineLabel", color: "#3b82f6" },
  { key: "robinson", label: "robinsonLabel", color: "#8b5cf6" },
  { key: "miller", label: "millerLabel", color: "#f59e0b" },
  { key: "hamwi", label: "hamwiLabel", color: "#ec4899" },
];

/** kg = base + inc × (inches − 60). */
export function coefOf(key: FormulaKey, g: Gender): { base: number; inc: number } {
  const m = g === "male";
  switch (key) {
    case "devine":
      return m ? { base: 50, inc: 2.3 } : { base: 45.5, inc: 2.3 };
    case "robinson":
      return m ? { base: 52, inc: 1.9 } : { base: 49, inc: 1.7 };
    case "miller":
      return m ? { base: 56.2, inc: 1.41 } : { base: 53.1, inc: 1.36 };
    default:
      return m ? { base: 48, inc: 2.7 } : { base: 45.5, inc: 2.2 };
  }
}

export const ideal = (g: Gender, cm: number): IdealWeightResult => calculateIdealWeight(g, cm);
export const inchesOver60 = (cm: number) => cm / 2.54 - 60;

/** The measurements the page treats as valid (the formulas stay positive across this span). */
export const H_MIN = 120;
export const H_MAX = 230;
export const W_MIN = 20;
export const W_MAX = 300;

export const WHO_LO = 18.5;
export const WHO_HI = 24.9;
export const IDEAL_COLOR = "#10b981";

export { bmiOf, weightAt };

/** The four broad WHO groups (underweight, normal, pre-obese, obese) with the BMI tool's hues. */
export type Group = "under" | "normal" | "over" | "obese";
export const GROUPS: { key: Group; min: number; max: number; color: string }[] = [
  { key: "under", min: 0, max: 18.5, color: WHO_CLASSES[2].color },
  { key: "normal", min: 18.5, max: 25, color: WHO_CLASSES[3].color },
  { key: "over", min: 25, max: 30, color: WHO_CLASSES[4].color },
  { key: "obese", min: 30, max: Infinity, color: WHO_CLASSES[6].color },
];
export const groupOf = (bmi: number) => GROUPS.find((x) => bmi < x.max) ?? GROUPS[GROUPS.length - 1];

/** One decimal, Western digits (indicator cards). */
export const kg1 = (v: number) => `${(Math.round(v * 10 + 1e-7) / 10).toFixed(1)} kg`;
export const signedKg = (v: number) => `${v >= 0 ? "+" : "−"}${(Math.round(Math.abs(v) * 10 + 1e-7) / 10).toFixed(1)} kg`;

/** Heights: whole numbers as they are, otherwise one decimal (Western digits). */
export const cmText = (v: number) => `${Number.isInteger(v) ? v : (Math.round(v * 10) / 10).toFixed(1)} cm`;
