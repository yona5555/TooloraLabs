/**
 * WHO adult BMI classification (WHO Technical Report Series 894, 2000; Table 2.1):
 * the eight bands every BMI visual on this page is drawn from. Pure helpers, no DOM.
 */
export type WhoKey = "severeThin" | "moderateThin" | "mildThin" | "normal" | "preObese" | "obese1" | "obese2" | "obese3";

export type WhoClass = { key: WhoKey; min: number; max: number; color: string };

/** One hue per band, readable on both the light and the dark page. */
export const WHO_CLASSES: WhoClass[] = [
  { key: "severeThin", min: 0, max: 16, color: "#6366f1" },
  { key: "moderateThin", min: 16, max: 17, color: "#3b82f6" },
  { key: "mildThin", min: 17, max: 18.5, color: "#0ea5e9" },
  { key: "normal", min: 18.5, max: 25, color: "#10b981" },
  { key: "preObese", min: 25, max: 30, color: "#f59e0b" },
  { key: "obese1", min: 30, max: 35, color: "#f97316" },
  { key: "obese2", min: 35, max: 40, color: "#ef4444" },
  { key: "obese3", min: 40, max: Infinity, color: "#be123c" },
];

/** The seven WHO cut-off points between the bands. */
export const WHO_CUTS = [16, 17, 18.5, 25, 30, 35, 40];

/** Ideal-weight reference point (BMI 22, the middle of the normal band). */
export const BMI_MID = 22;

export function whoIndex(bmi: number): number {
  const i = WHO_CLASSES.findIndex((c) => bmi < c.max);
  return i === -1 ? WHO_CLASSES.length - 1 : i;
}

export const whoOf = (bmi: number) => WHO_CLASSES[whoIndex(bmi)];

export const bmiOf = (kg: number, cm: number) => kg / (cm / 100) ** 2;

export const weightAt = (bmi: number, cm: number) => bmi * (cm / 100) ** 2;

export const r1 = (v: number) => Math.round(v * 10 + 1e-7) / 10;
