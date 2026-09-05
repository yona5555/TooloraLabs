export type { MacroGoal, MacroBreakdown, MacroCalculatorError, MacroCalculatorOutput as MacroResult } from "@tooloralabs/tools";

export const MACRO_GOALS = ["lose", "maintain", "gain", "buildMuscle"] as const;

export type StoredTdeeResult = { dailyCalorieTarget: number; tdee: number };

let cachedRaw: string | null = null;
let cachedResult: StoredTdeeResult | null = null;

/**
 * Returns a referentially stable snapshot (same object as last call whenever the underlying
 * localStorage string hasn't changed), as required by useSyncExternalStore's getSnapshot
 * contract — parsing a fresh object on every call would make React think the store changes
 * on every render and loop.
 */
export function readStoredTdeeResult(): StoredTdeeResult | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem("toolora:tdee-result");
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedResult;

  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cachedResult = typeof parsed?.dailyCalorieTarget === "number" && typeof parsed?.tdee === "number" ? parsed : null;
  } catch {
    cachedResult = null;
  }
  return cachedResult;
}
