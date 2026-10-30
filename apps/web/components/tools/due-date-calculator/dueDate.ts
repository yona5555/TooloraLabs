import type { DueDateMethod, DueDateResult } from "./types";

/**
 * Display-side date helpers for the due-date visuals. Dates are whole day numbers (days since
 * 1970-01-01, UTC), so no time zone or daylight-saving shift can move a date by one. The
 * calculator's own result (packages/tools) stays the single source of the due date, conception
 * date and gestational age; everything here only lays those dates out on calendars and scales.
 */

export const DAY_MS = 86_400_000;
/** Naegele: 280 days (40 weeks) from the first day of the last menstrual period (LMP). */
export const TERM_DAYS = 280;
/** Conception is about 14 days after the LMP in a 28-day cycle. */
export const LMP_TO_CONCEPTION = 14;
export const CONCEPTION_TO_DUE = 266;

export function isoToDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function dayToISO(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

/** Gestational age in clinical "weeks+days" notation, e.g. 10+3. */
export const wd = (days: number) => `${Math.floor(days / 7)}+${days % 7}`;

/** Naegele's mnemonic on the calendar: LMP + 1 year − 3 months + 7 days. */
export function naegeleMnemonic(lmp: number): number {
  const d = new Date(lmp * DAY_MS);
  const t = new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth() - 3, 1));
  const lastDay = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return Math.round(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d.getUTCDate(), lastDay)) / DAY_MS) + 7;
}

// ── Snapshot ────────────────────────────────────────────────────────────────────────────
export type DueSnap = {
  method: DueDateMethod;
  /** The entered date (LMP, conception or transfer date). */
  anchor: number;
  /** Cycle length used (28 when the method does not use one). */
  cycle: number;
  today: number;
  conception: number;
  due: number;
  /** Equivalent LMP: conception − 14 days (= the entered LMP, cycle-adjusted, in LMP mode). */
  lmp: number;
  /** Gestational age today in days (from the calculator's weeks + days). */
  ga: number;
  trimester: 1 | 2 | 3;
  daysLeft: number;
  percent: number;
};

export function snapOf(method: DueDateMethod, anchorISO: string, cycle: number, r: DueDateResult): DueSnap {
  const conception = isoToDay(r.conceptionDateISO);
  const due = isoToDay(r.dueDateISO);
  return {
    method,
    anchor: isoToDay(anchorISO),
    cycle: method === "lmp" ? cycle : Number.isFinite(cycle) && cycle >= 20 && cycle <= 45 ? cycle : 28,
    today: due - r.daysUntilDue,
    conception,
    due,
    lmp: conception - LMP_TO_CONCEPTION,
    ga: r.gestationalAgeWeeks * 7 + r.gestationalAgeDays,
    trimester: r.trimester,
    daysLeft: r.daysUntilDue,
    percent: r.percentComplete,
  };
}

// ── Conventions ─────────────────────────────────────────────────────────────────────────
/** ACOG trimesters (days from the LMP): 0w0d–13w6d, 14w0d–27w6d, 28w0d onwards. */
export const TRIMESTERS = [
  { n: 1 as const, from: 0, to: 98, color: "#0ea5e9" },
  { n: 2 as const, from: 98, to: 196, color: "#8b5cf6" },
  { n: 3 as const, from: 196, to: TERM_DAYS, color: "#f59e0b" },
];
export const trimesterOf = (ga: number) => (ga < 98 ? 1 : ga < 196 ? 2 : 3);

/** ACOG Committee Opinion 579 (2013) term definitions, in days from the LMP. */
export type ZoneKey = "preterm" | "early" | "full" | "late" | "post";
export const ZONES: { key: ZoneKey; from: number; to: number; color: string }[] = [
  { key: "preterm", from: 0, to: 259, color: "#ef4444" },
  { key: "early", from: 259, to: 273, color: "#84cc16" },
  { key: "full", from: 273, to: 287, color: "#16a34a" },
  { key: "late", from: 287, to: 294, color: "#f59e0b" },
  { key: "post", from: 294, to: 400, color: "#dc2626" },
];
export const zoneOf = (ga: number): ZoneKey => (ZONES.find((z) => ga >= z.from && ga < z.to) ?? ZONES[ZONES.length - 1]).key;

/** A typical prenatal care schedule (ACOG guidance), in days from the LMP: [start, end). */
export type MilestoneKey = "test" | "dating" | "nt" | "anatomy" | "glucose" | "tdap" | "gbs";
export const MILESTONES: { key: MilestoneKey; from: number; to: number; color: string }[] = [
  { key: "test", from: 28, to: 42, color: "#06b6d4" },
  { key: "dating", from: 56, to: 98, color: "#0ea5e9" },
  { key: "nt", from: 77, to: 98, color: "#3b82f6" },
  { key: "anatomy", from: 126, to: 161, color: "#8b5cf6" },
  { key: "glucose", from: 168, to: 203, color: "#d946ef" },
  { key: "tdap", from: 189, to: 259, color: "#f97316" },
  { key: "gbs", from: 252, to: 266, color: "#14b8a6" },
];

/**
 * ACOG Committee Opinion 700 (2017): redate by ultrasound when the ultrasound and LMP dates
 * differ by more than this many days, by gestational age at the scan.
 */
export function redateThreshold(ga: number): number {
  if (ga < 63) return 5;
  if (ga < 112) return 7;
  if (ga < 154) return 10;
  if (ga < 196) return 14;
  return 21;
}

// ── Birth-timing model (labelled as an assumption in the UI) ────────────────────────────
/** Spontaneous birth modelled as a bell curve centred on the due date (day 280), SD 10 days. */
export const BIRTH_SD = 10;
function erf(x: number): number {
  // Abramowitz–Stegun 7.1.26 (max error 1.5e-7).
  const s = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}
/** P(birth before gestational day `ga`). */
export const birthCdf = (ga: number) => 0.5 * (1 + erf((ga - TERM_DAYS) / (BIRTH_SD * Math.SQRT2)));
/** P(birth during the given gestational day). */
export const birthOnDay = (ga: number) => birthCdf(ga + 0.5) - birthCdf(ga - 0.5);
