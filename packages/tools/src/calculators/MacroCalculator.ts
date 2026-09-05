import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MacroGoal = "lose" | "maintain" | "gain" | "buildMuscle";

export type MacroCalculatorInput = {
  totalCalories: number;
  goal: MacroGoal;
};

export type MacroCalculatorError = "invalid-calories";

export type MacroBreakdown = {
  grams: number;
  calories: number;
  percent: number;
};

export type MacroCalculatorOutput = {
  error: MacroCalculatorError | null;
  protein: MacroBreakdown;
  carbs: MacroBreakdown;
  fat: MacroBreakdown;
};

const PROTEIN_KCAL_PER_G = 4;
const CARBS_KCAL_PER_G = 4;
const FAT_KCAL_PER_G = 9;

/**
 * Percentage-of-calories splits per goal, each chosen from within the Institute of Medicine's
 * Acceptable Macronutrient Distribution Range (AMDR: protein 10-35%, carbohydrate 45-65%, fat
 * 20-35% of total calories) rather than an informal fixed ratio — so every split here is
 * defensible against the actual dietary reference standard, not just a popular rule of thumb.
 * Protein is weighted toward the upper end of its AMDR band for "lose" and "buildMuscle" to
 * support lean mass preservation/growth, consistent with sports-nutrition guidance on higher
 * relative protein intake during a deficit or a resistance-training-driven surplus.
 */
const GOAL_SPLITS: Record<MacroGoal, { protein: number; carbs: number; fat: number }> = {
  lose: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  maintain: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  gain: { protein: 0.2, carbs: 0.55, fat: 0.25 },
  buildMuscle: { protein: 0.3, carbs: 0.5, fat: 0.2 },
};

function breakdown(totalCalories: number, percent: number, kcalPerGram: number): MacroBreakdown {
  const calories = totalCalories * percent;
  return { grams: calories / kcalPerGram, calories, percent: percent * 100 };
}

export class MacroCalculator extends BaseCalculator<MacroCalculatorInput, MacroCalculatorOutput> {
  metadata = {
    id: "macro-calculator",
    slug: "macro-calculator",
    name: "Macro Calculator",
    category: "health-fitness",
    description: "Calculate your daily protein, carbohydrate, and fat targets in grams and calories from your total daily calories and goal.",
    version: "1.0.0",
  };

  execute(input: MacroCalculatorInput, _context: ToolContext): ToolResult<MacroCalculatorOutput> {
    const { totalCalories, goal } = input;

    if (!Number.isFinite(totalCalories) || totalCalories <= 0 || totalCalories > 20000) {
      return this.error("invalid-calories");
    }

    const split = GOAL_SPLITS[goal];

    return {
      success: true,
      data: {
        error: null,
        protein: breakdown(totalCalories, split.protein, PROTEIN_KCAL_PER_G),
        carbs: breakdown(totalCalories, split.carbs, CARBS_KCAL_PER_G),
        fat: breakdown(totalCalories, split.fat, FAT_KCAL_PER_G),
      },
      metadata: {},
    };
  }

  private error(error: MacroCalculatorError): ToolResult<MacroCalculatorOutput> {
    const empty: MacroBreakdown = { grams: 0, calories: 0, percent: 0 };
    return { success: true, data: { error, protein: empty, carbs: empty, fat: empty }, metadata: {} };
  }
}
