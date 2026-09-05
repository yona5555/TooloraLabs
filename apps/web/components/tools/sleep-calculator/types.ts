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
