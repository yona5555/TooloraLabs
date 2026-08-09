import type { Gender } from "./BMICalculator";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

/** Standard Harris-Benedict-derived activity multipliers, the same scale used across virtually every TDEE calculator. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/**
 * Mifflin-St Jeor (1990) — the clinically preferred resting-energy-expenditure
 * equation for most adults, more accurate on average than the older
 * Harris-Benedict formula it replaced.
 */
export function calculateBMRMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || !Number.isFinite(age) || weightKg <= 0 || heightCm <= 0 || age <= 0) {
    return 0;
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

/**
 * Katch-McArdle — uses lean body mass directly instead of total weight, so it
 * stays accurate for visibly muscular or very lean people where Mifflin-St
 * Jeor (which only sees total weight) tends to over- or under-estimate.
 * Only usable when the visitor actually knows their body fat percentage.
 */
export function calculateBMRKatchMcArdle(weightKg: number, bodyFatPercent: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(bodyFatPercent) || weightKg <= 0 || bodyFatPercent < 0 || bodyFatPercent >= 100) {
    return 0;
  }
  const leanMassKg = weightKg * (1 - bodyFatPercent / 100);
  return 370 + 21.6 * leanMassKg;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  if (!Number.isFinite(bmr) || bmr <= 0) return 0;
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/** A commonly cited approximation: roughly 7,700 kcal correspond to 1 kg of body fat. */
export const KCAL_PER_KG_BODY_FAT = 7700;

export type GoalDirection = "lose" | "maintain" | "gain";

export type WeightGoalResult = {
  dailyCalorieTarget: number;
  dailyAdjustment: number;
  adjustmentPercentOfTDEE: number;
  isAggressive: boolean;
};

/**
 * `weeklyChangeKg` is signed: negative to lose weight, positive to gain, 0 to
 * maintain. Flags the result as "aggressive" once the daily adjustment
 * exceeds 35% of maintenance calories — a widely used rule-of-thumb ceiling
 * beyond which a deficit/surplus becomes hard to sustain and risks losing
 * lean mass (on a cut) or excess fat gain (on a bulk).
 */
export function calculateWeightGoal(tdee: number, weeklyChangeKg: number): WeightGoalResult {
  if (!Number.isFinite(tdee) || tdee <= 0 || !Number.isFinite(weeklyChangeKg)) {
    return { dailyCalorieTarget: 0, dailyAdjustment: 0, adjustmentPercentOfTDEE: 0, isAggressive: false };
  }
  const dailyAdjustment = (weeklyChangeKg * KCAL_PER_KG_BODY_FAT) / 7;
  const dailyCalorieTarget = Math.max(tdee + dailyAdjustment, 0);
  const adjustmentPercentOfTDEE = (Math.abs(dailyAdjustment) / tdee) * 100;

  return {
    dailyCalorieTarget,
    dailyAdjustment,
    adjustmentPercentOfTDEE,
    isAggressive: adjustmentPercentOfTDEE > 35,
  };
}
