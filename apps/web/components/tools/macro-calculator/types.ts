export type { MacroGoal, MacroBreakdown, MacroCalculatorError, MacroCalculatorOutput as MacroResult } from "@tooloralabs/tools";

export const MACRO_GOALS = ["lose", "maintain", "gain", "buildMuscle"] as const;

export type StoredTdeeResult = { dailyCalorieTarget: number; tdee: number };

export function readStoredTdeeResult(): StoredTdeeResult | null {
  try {
    const raw = window.localStorage.getItem("toolora:tdee-result");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.dailyCalorieTarget === "number" && typeof parsed?.tdee === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}
