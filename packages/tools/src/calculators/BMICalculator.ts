import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type BMIResult = {
  bmi: number;
  category: string;
  healthyMinWeight: number;
  healthyMaxWeight: number;
};

export type BMIInput = { heightCm: number; weightKg: number };

export type Gender = "male" | "female";

/**
 * Deurenberg et al. (1991), British Journal of Nutrition 65:105-114 — the
 * adult and youth (<=15) prediction formulas for body-fat percentage from
 * BMI, age and sex. An estimate, not a direct measurement.
 */
export function estimateBodyFatPercentage(
  bmi: number,
  age: number,
  gender: Gender
): number {
  const sex = gender === "male" ? 1 : 0;
  const raw =
    age <= 15
      ? 1.51 * bmi - 0.7 * age - 3.6 * sex + 1.4
      : 1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4;

  return Number(Math.max(raw, 0).toFixed(1));
}

export class BMICalculator extends BaseCalculator<BMIInput, BMIResult> {
  metadata = {
    id: "bmi-calculator",
    slug: "bmi-calculator",
    name: "BMI Calculator",
    category: "calculators",
    description: "Calculate Body Mass Index and healthy weight range.",
    version: "1.0.0",
  };

  execute(input: BMIInput, _context: ToolContext): ToolResult<BMIResult> {
    const heightM = input.heightCm / 100;
    const bmi = input.weightKg / (heightM * heightM);

    let category = "Obesity";
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 25) {
      category = "Normal weight";
    } else if (bmi < 30) {
      category = "Overweight";
    }

    return {
      success: true,
      data: {
        bmi: Number(bmi.toFixed(1)),
        category,
        healthyMinWeight: Number((18.5 * heightM * heightM).toFixed(1)),
        healthyMaxWeight: Number((24.9 * heightM * heightM).toFixed(1)),
      },
      metadata: {},
    };
  }
}
