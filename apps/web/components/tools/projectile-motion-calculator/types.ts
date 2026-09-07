export type {
  ProjectileMotionCalculatorOutput as ProjectileMotionResult,
} from "@tooloralabs/tools";

export type GravityPreset = "earth" | "moon" | "mars" | "custom";

export const GRAVITY_PRESETS: GravityPreset[] = ["earth", "moon", "mars", "custom"];

export const GRAVITY_PRESET_VALUES: Record<Exclude<GravityPreset, "custom">, number> = {
  earth: 9.8,
  moon: 1.62,
  mars: 3.71,
};
