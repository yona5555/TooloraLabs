"use client";
import { createContext, useContext } from "react";
import type { MacroGoal } from "./types";
import type { MacroSplit } from "./macros";

/**
 * The calculator's last valid result (calories, goal and the three macros), shared with the
 * indicator cards in the education section. Two cards write back: the calories stack card sets the
 * calorie total and the AMDR card sets the goal, so dragging them moves the inputs, the Result
 * table and the 3D plate.
 */
export type MacroSnapshot = { calories: number; goal: MacroGoal } & MacroSplit;

export type MacroLive = { snap: MacroSnapshot; setGoal: (goal: MacroGoal) => void; setCalories: (kcal: number) => void };

export const MacroLiveContext = createContext<MacroLive | null>(null);

export function useMacroLive(): MacroLive {
  const v = useContext(MacroLiveContext);
  if (!v) throw new Error("useMacroLive outside MacroLiveContext");
  return v;
}
