import { describe, it, expect } from "vitest";
import {
  calculateBMRMifflinStJeor,
  calculateBMRKatchMcArdle,
  calculateTDEE,
  calculateWeightGoal,
  ACTIVITY_MULTIPLIERS,
} from "../TDEECalculator";

describe("calculateBMRMifflinStJeor", () => {
  it("computes BMR for a male", () => {
    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMRMifflinStJeor(70, 175, 25, "male")).toBeCloseTo(1673.75, 2);
  });

  it("computes BMR for a female (161 offset instead of +5)", () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    expect(calculateBMRMifflinStJeor(60, 165, 30, "female")).toBeCloseTo(1320.25, 2);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateBMRMifflinStJeor(0, 175, 25, "male")).toBe(0);
    expect(calculateBMRMifflinStJeor(70, 175, NaN, "male")).toBe(0);
    expect(calculateBMRMifflinStJeor(-5, 175, 25, "male")).toBe(0);
  });
});

describe("calculateBMRKatchMcArdle", () => {
  it("computes BMR from lean body mass", () => {
    // lean mass = 70 * 0.85 = 59.5; BMR = 370 + 21.6*59.5 = 1655.2
    expect(calculateBMRKatchMcArdle(70, 15)).toBeCloseTo(1655.2, 1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateBMRKatchMcArdle(0, 15)).toBe(0);
    expect(calculateBMRKatchMcArdle(70, -1)).toBe(0);
    expect(calculateBMRKatchMcArdle(70, 100)).toBe(0);
  });
});

describe("calculateTDEE", () => {
  it("applies the activity multiplier", () => {
    expect(calculateTDEE(1600, "sedentary")).toBeCloseTo(1600 * ACTIVITY_MULTIPLIERS.sedentary, 5);
    expect(calculateTDEE(1600, "veryActive")).toBeCloseTo(1600 * 1.9, 5);
  });

  it("returns 0 for a non-positive BMR", () => {
    expect(calculateTDEE(0, "moderate")).toBe(0);
    expect(calculateTDEE(-10, "moderate")).toBe(0);
  });
});

describe("calculateWeightGoal", () => {
  it("computes a maintenance target for zero weekly change", () => {
    const result = calculateWeightGoal(2500, 0);
    expect(result.dailyCalorieTarget).toBeCloseTo(2500, 5);
    expect(result.isAggressive).toBe(false);
  });

  it("computes a moderate deficit for weight loss", () => {
    // -0.5 kg/week -> -0.5*7700/7 = -550 kcal/day
    const result = calculateWeightGoal(2500, -0.5);
    expect(result.dailyAdjustment).toBeCloseTo(-550, 1);
    expect(result.dailyCalorieTarget).toBeCloseTo(1950, 1);
    expect(result.isAggressive).toBe(false);
  });

  it("flags an aggressive deficit beyond 35% of TDEE", () => {
    // -1.5 kg/week on a 2000 kcal TDEE -> -1650 kcal/day, 82.5% of TDEE
    const result = calculateWeightGoal(2000, -1.5);
    expect(result.isAggressive).toBe(true);
  });

  it("never returns a negative calorie target", () => {
    const result = calculateWeightGoal(1500, -3);
    expect(result.dailyCalorieTarget).toBe(0);
  });

  it("returns a zeroed result for invalid TDEE", () => {
    expect(calculateWeightGoal(0, -0.5)).toEqual({
      dailyCalorieTarget: 0,
      dailyAdjustment: 0,
      adjustmentPercentOfTDEE: 0,
      isAggressive: false,
    });
  });
});
