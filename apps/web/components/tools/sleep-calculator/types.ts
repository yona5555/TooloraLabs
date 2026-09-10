import type { SleepMode } from "@tooloralabs/tools";
export type { SleepMode, SleepCalculatorError, SleepOption, SleepCalculatorOutput as SleepResult } from "@tooloralabs/tools";

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return -1;
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type SleepScenario = { key: string; mode: SleepMode; time: string; fallAsleepMinutes: string };

export const SLEEP_SCENARIOS: SleepScenario[] = [
  { key: "earlyRiser", mode: "wakeUp", time: "06:00", fallAsleepMinutes: "15" },
  { key: "lateNightBedtime", mode: "bedtime", time: "23:30", fallAsleepMinutes: "15" },
  { key: "quickSleeper", mode: "wakeUp", time: "07:30", fallAsleepMinutes: "5" },
];
