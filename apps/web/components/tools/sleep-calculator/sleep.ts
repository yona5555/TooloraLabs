import type { SleepMode, SleepOption } from "./types";

/**
 * Pure helpers for the sleep visuals (no DOM). The calculator itself (packages/tools) gives the
 * four options; everything here only derives display values from them with the same rules:
 * whole 90-minute cycles plus the minutes needed to fall asleep.
 */
export const CYCLE_MIN = 90;
export const DAY = 1440;

export const wrap = (m: number) => ((Math.round(m) % DAY) + DAY) % DAY;

/** 12-hour clock, same format as the Result card ("10:15 PM"). Western digits. */
export function clock(minutes: number): string {
  const m0 = wrap(minutes);
  const h24 = Math.floor(m0 / 60);
  const m = m0 % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "7 h 30 min" style duration (Western digits, unit symbols). */
export function dur(minutes: number): string {
  const m = Math.round(Math.abs(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

/** Hours with only the decimals needed: 450 → "7.5 h", 405 → "6.75 h", 480 → "8 h". */
export const hrs = (minutes: number) => `${Number((minutes / 60).toFixed(2))} h`;

export const sgnMin = (m: number) => `${m > 0 ? "+" : m < 0 ? "−" : "±"}${dur(m)}`;

/** One option with its night laid out: in bed, asleep (after the latency), awake. */
export type Night = SleepOption & { bed: number; onset: number; wake: number };

export type SleepSnapshot = {
  mode: SleepMode;
  /** The time the visitor entered (wake-up or bedtime), minutes since midnight. */
  anchor: number;
  latency: number;
  nights: Night[];
};

export function nightsFor(mode: SleepMode, anchor: number, latency: number, options: SleepOption[]): Night[] {
  return options.map((o) => {
    if (mode === "wakeUp") return { ...o, bed: o.clockMinutes, onset: wrap(o.clockMinutes + latency), wake: anchor };
    return { ...o, bed: anchor, onset: wrap(anchor + latency), wake: o.clockMinutes };
  });
}

/** Same rule as the calculator, for what-if values the cards try out (cycle length, latency). */
export function optionClock(mode: SleepMode, anchor: number, latency: number, cycles: number, cycleMin = CYCLE_MIN): number {
  return wrap(mode === "wakeUp" ? anchor - latency - cycles * cycleMin : anchor + latency + cycles * cycleMin);
}

// ── Sleep stages ────────────────────────────────────────────────────────────────────────
export const STAGES = ["n1", "n2", "n3", "rem"] as const;
export type StageKey = (typeof STAGES)[number] | "wake";
export const STAGE_COLORS: Record<StageKey, string> = {
  wake: "#f59e0b",
  rem: "#ec4899",
  n1: "#22d3ee",
  n2: "#3b82f6",
  n3: "#7c3aed",
};

/**
 * Typical minutes per stage in each 90-minute cycle of a healthy adult night (textbook sleep
 * architecture, Carskadon & Dement): deep N3 sleep is front-loaded and fades after the third
 * cycle, REM grows longer towards morning. Each row adds up to 90. Approximate model, labelled.
 */
export const CYCLE_STAGES: Record<(typeof STAGES)[number], number>[] = [
  { n1: 5, n2: 45, n3: 30, rem: 10 },
  { n1: 4, n2: 46, n3: 25, rem: 15 },
  { n1: 3, n2: 52, n3: 15, rem: 20 },
  { n1: 3, n2: 57, n3: 5, rem: 25 },
  { n1: 3, n2: 57, n3: 0, rem: 30 },
  { n1: 3, n2: 55, n3: 0, rem: 32 },
];
export const cycleStages = (i: number) => CYCLE_STAGES[Math.min(i, CYCLE_STAGES.length - 1)];

/** Order inside one cycle: N1 → N2 → N3 → N2 → REM (N2 split in two halves around N3). */
export function cycleSegments(i: number): { stage: StageKey; from: number; to: number }[] {
  const c = cycleStages(i);
  const seq: [StageKey, number][] = [
    ["n1", c.n1],
    ["n2", c.n2 / 2],
    ["n3", c.n3],
    ["n2", c.n2 / 2],
    ["rem", c.rem],
  ];
  const out: { stage: StageKey; from: number; to: number }[] = [];
  let t = i * CYCLE_MIN;
  for (const [stage, len] of seq) {
    if (len <= 0) continue;
    out.push({ stage, from: t, to: t + len });
    t += len;
  }
  return out;
}

/** Stage after `t` minutes asleep, and how far into its cycle that is. */
export function stageAt(t: number): { stage: StageKey; cycle: number; into: number } {
  const cycle = Math.floor(t / CYCLE_MIN);
  const into = t - cycle * CYCLE_MIN;
  if (into === 0 && t > 0) return { stage: "wake", cycle, into };
  const seg = cycleSegments(cycle).find((s) => t >= s.from && t < s.to);
  return { stage: seg?.stage ?? "rem", cycle, into };
}

export function stageTotals(cycles: number) {
  const tot = { n1: 0, n2: 0, n3: 0, rem: 0 };
  for (let i = 0; i < cycles; i++) for (const k of STAGES) tot[k] += cycleStages(i)[k];
  return tot;
}

// ── Recommended sleep by age (National Sleep Foundation 2015, Hirshkowitz et al.) ───────
export type AgeGroup = { key: string; rec: [number, number]; may: [number, number] };
export const AGE_GROUPS: AgeGroup[] = [
  { key: "newborn", rec: [14, 17], may: [11, 19] },
  { key: "infant", rec: [12, 15], may: [10, 18] },
  { key: "toddler", rec: [11, 14], may: [9, 16] },
  { key: "preschool", rec: [10, 13], may: [8, 14] },
  { key: "school", rec: [9, 11], may: [7, 12] },
  { key: "teen", rec: [8, 10], may: [7, 11] },
  { key: "youngAdult", rec: [7, 9], may: [6, 11] },
  { key: "adult", rec: [7, 9], may: [6, 10] },
  { key: "older", rec: [7, 8], may: [5, 9] },
];
/** The cards assume an adult (26–64) until the visitor picks another age group. */
export const ADULT_INDEX = 7;

export type AgeVerdict = "rec" | "may" | "no";
export function ageVerdict(g: AgeGroup, hours: number): AgeVerdict {
  if (hours >= g.rec[0] - 1e-9 && hours <= g.rec[1] + 1e-9) return "rec";
  if (hours >= g.may[0] - 1e-9 && hours <= g.may[1] + 1e-9) return "may";
  return "no";
}
export const VERDICT_COLORS: Record<AgeVerdict, string> = { rec: "#22c55e", may: "#f59e0b", no: "#ef4444" };

// ── Sleep quality markers (NSF sleep-quality consensus, Ohayon et al. 2017) ─────────────
export type LatencyKey = "veryFast" | "good" | "uncertain" | "poor";
export function latencyKey(min: number): LatencyKey {
  if (min < 5) return "veryFast";
  if (min <= 30) return "good";
  if (min <= 45) return "uncertain";
  return "poor";
}
export type EffKey = "low" | "good" | "excellent";
export const EFF_ZONES: { key: EffKey; from: number; to: number; color: string }[] = [
  { key: "low", from: 70, to: 85, color: "#ef4444" },
  { key: "good", from: 85, to: 90, color: "#f59e0b" },
  { key: "excellent", from: 90, to: 100, color: "#22c55e" },
];
export const effZone = (pct: number) => EFF_ZONES.find((z) => pct < z.to) ?? EFF_ZONES[EFF_ZONES.length - 1];

// ── Evening wind-down stations (minutes relative to bedtime; common sleep-hygiene guidance) ─
export const WIND_DOWN: { key: string; at: number }[] = [
  { key: "caffeine", at: -360 },
  { key: "meal", at: -180 },
  { key: "dim", at: -120 },
  { key: "screens", at: -60 },
  { key: "bed", at: 0 },
];

/** Option colours: the two recommended options (6 and 5 cycles) in blues, shorter ones muted. */
export const OPTION_COLORS: Record<number, string> = { 6: "#4f46e5", 5: "#2563eb", 4: "#0ea5e9", 3: "#94a3b8" };
