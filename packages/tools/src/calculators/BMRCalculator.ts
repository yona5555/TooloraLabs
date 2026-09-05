import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import type { Gender } from "./BMICalculator";

export type BMRFormula = "harrisBenedict" | "mifflinStJeor" | "compare";

export type BMRCalculatorInput = {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  formula: BMRFormula;
};

export type BMRCalculatorError = "invalid-measurements";

export type BMRCalculatorOutput = {
  error: BMRCalculatorError | null;
  harrisBenedict: number | null;
  mifflinStJeor: number | null;
  differenceKcal: number | null;
};

/**
 * The original Harris-Benedict equation (Harris & Benedict, 1919) — not the 1984 Roza &
 * Shizgal revision some modern calculators use. Kept in its original historical form here
 * specifically so it can be shown alongside Mifflin-St Jeor as a direct, citable comparison
 * between "the equation that started resting-metabolism estimation" and "the one that later
 * replaced it in clinical preference."
 */
function calculateHarrisBenedict(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (gender === "male") {
    return 66.473 + 13.7516 * weightKg + 5.0033 * heightCm - 6.755 * age;
  }
  return 655.0955 + 9.5634 * weightKg + 1.8496 * heightCm - 4.6756 * age;
}

/** Mifflin-St Jeor (Mifflin et al., 1990) — the equation the Academy of Nutrition and Dietetics recommends as most accurate for the general adult population today. */
function calculateMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export class BMRCalculator extends BaseCalculator<BMRCalculatorInput, BMRCalculatorOutput> {
  metadata = {
    id: "bmr-calculator",
    slug: "bmr-calculator",
    name: "BMR Calculator",
    category: "health-fitness",
    description: "Calculate your Basal Metabolic Rate using the Harris-Benedict (1919) and Mifflin-St Jeor (1990) equations, with a side-by-side comparison.",
    version: "1.0.0",
  };

  execute(input: BMRCalculatorInput, _context: ToolContext): ToolResult<BMRCalculatorOutput> {
    const { gender, weightKg, heightCm, age, formula } = input;

    const valid =
      Number.isFinite(weightKg) && weightKg > 0 && weightKg < 500 &&
      Number.isFinite(heightCm) && heightCm > 0 && heightCm < 300 &&
      Number.isFinite(age) && age > 0 && age <= 120;

    if (!valid) {
      return this.error("invalid-measurements");
    }

    const harrisBenedict = formula === "mifflinStJeor" ? null : calculateHarrisBenedict(weightKg, heightCm, age, gender);
    const mifflinStJeor = formula === "harrisBenedict" ? null : calculateMifflinStJeor(weightKg, heightCm, age, gender);
    const differenceKcal = harrisBenedict !== null && mifflinStJeor !== null ? harrisBenedict - mifflinStJeor : null;

    return {
      success: true,
      data: { error: null, harrisBenedict, mifflinStJeor, differenceKcal },
      metadata: {},
    };
  }

  private error(error: BMRCalculatorError): ToolResult<BMRCalculatorOutput> {
    return { success: true, data: { error, harrisBenedict: null, mifflinStJeor: null, differenceKcal: null }, metadata: {} };
  }
}
