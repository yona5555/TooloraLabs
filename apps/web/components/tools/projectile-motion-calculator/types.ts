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

export type ProjectileInputs = { speed: string; angle: string; height: string; gravity: string };

export const PROJECTILE_DEFAULTS: ProjectileInputs = { speed: "20", angle: "45", height: "0", gravity: "9.8" };

// Real everyday and iconic launches, each paired with the world whose
// gravity it was (or would be) launched under.
export const PROJECTILE_SCENARIOS: { key: string; speed: string; angle: string; height: string; gravityPreset: Exclude<GravityPreset, "custom"> }[] = [
  { key: "basketballShot", speed: "8", angle: "50", height: "2", gravityPreset: "earth" },
  { key: "soccerKick", speed: "25", angle: "30", height: "0", gravityPreset: "earth" },
  { key: "baseballThrow", speed: "35", angle: "35", height: "1.8", gravityPreset: "earth" },
  { key: "golfDrive", speed: "70", angle: "12", height: "0", gravityPreset: "earth" },
  { key: "cannonball", speed: "120", angle: "45", height: "0", gravityPreset: "earth" },
  { key: "moonGolfShot", speed: "25", angle: "45", height: "0", gravityPreset: "moon" },
];
