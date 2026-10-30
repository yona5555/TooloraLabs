import type { OvulationResult } from "./types";

/**
 * Display-side helpers for the ovulation visuals. Dates are whole day numbers (days since
 * 1970-01-01, UTC), so no time zone or daylight-saving shift can move a date by one. The
 * calculator's own result (packages/tools) stays the single source of the ovulation dates,
 * fertile windows and next periods; everything here only lays those dates out on wheels,
 * calendars and scales.
 */

export const DAY_MS = 86_400_000;

export function isoToDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** Positive modulo (cycle day of a date before the entered LMP still lands in 0 … c−1). */
export const mod = (a: number, n: number) => ((a % n) + n) % n;

// ── Snapshot ────────────────────────────────────────────────────────────────────────────
export type OvCycle = {
  n: number;
  /** First day of this cycle's period. */
  start: number;
  fwStart: number;
  ov: number;
  fwEnd: number;
  /** First day of the next period. */
  next: number;
};

export type OvSnap = {
  lmp: number;
  cycle: number;
  luteal: number;
  today: number;
  cycles: OvCycle[];
  /** Days from the period start to ovulation: cycle − luteal (= the follicular phase). */
  ovOffset: number;
  /** Days since the entered LMP (may be negative for a future date). */
  sinceLmp: number;
  /** Today's 0-based day inside its (projected) cycle. */
  dayIdx: number;
};

/** `todayISO` comes from useTodayISO, so the server and the hydrating render agree on today. */
export function snapOf(lmpISO: string, cycle: number, luteal: number, r: OvulationResult, todayISO: string): OvSnap {
  const lmp = isoToDay(lmpISO);
  const cycles = r.cycles.map((c, i) => {
    const next = isoToDay(c.nextPeriodDateISO);
    return { n: c.cycleNumber, start: i === 0 ? lmp : isoToDay(r.cycles[i - 1].nextPeriodDateISO), fwStart: isoToDay(c.fertileWindowStartISO), ov: isoToDay(c.ovulationDateISO), fwEnd: isoToDay(c.fertileWindowEndISO), next };
  });
  const today = isoToDay(todayISO);
  const ovOffset = cycles[0].ov - lmp;
  return { lmp, cycle, luteal, today, cycles, ovOffset, sinceLmp: today - lmp, dayIdx: mod(today - lmp, cycle) };
}

// ── Conventions (labelled as assumptions in the UI) ─────────────────────────────────────
/** Menstrual bleeding drawn as the first 5 days of a cycle (typical 2–7 days, ACOG). */
export const MENSES_DAYS = 5;
/** The calculator's fertile window: 5 days before ovulation through 1 day after. */
export const FW_BEFORE = 5;
export const FW_AFTER = 1;

/**
 * Wilcox, Weinberg & Baird, NEJM 1995;333:1517 — chance of conception from intercourse on a
 * single day, by day relative to ovulation (−5 … 0). No pregnancy followed intercourse on the
 * day after ovulation (+1), which the calculator still includes because the egg lives ~24 h.
 */
export const WILCOX: Record<number, number> = { [-5]: 0.1, [-4]: 0.16, [-3]: 0.14, [-2]: 0.27, [-1]: 0.31, 0: 0.33, 1: 0 };
export const wilcoxOf = (rel: number) => WILCOX[rel] ?? 0;

/** FIGO 2018 (Munro et al.): normal frequency of menses = cycles of 24–38 days. */
export const FIGO_LO = 24;
export const FIGO_HI = 38;

export type PhaseKey = "menses" | "follicular" | "fertile" | "ovulation" | "luteal";
export const PHASE_COLORS: Record<PhaseKey, string> = {
  menses: "#e11d48",
  follicular: "#0ea5e9",
  fertile: "#22c55e",
  ovulation: "#f59e0b",
  luteal: "#8b5cf6",
};

/** Phase of a 0-based cycle day for a cycle whose ovulation falls on day `ovOffset`. */
export function phaseOf(idx: number, ovOffset: number): PhaseKey {
  if (idx === ovOffset) return "ovulation";
  if (idx >= ovOffset - FW_BEFORE && idx <= ovOffset + FW_AFTER) return "fertile";
  if (idx < MENSES_DAYS) return "menses";
  if (idx < ovOffset) return "follicular";
  return "luteal";
}

/**
 * Chance that at least one of several single-day exposures leads to conception, treating days
 * as independent (a simplification, labelled in the UI).
 */
export const combined = (ps: number[]) => 1 - ps.reduce((acc, p) => acc * (1 - p), 1);
