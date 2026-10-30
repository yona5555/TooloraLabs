import { PregnancyCalculator as PregnancyTool } from "@tooloralabs/tools";
import type { PregnancyResult, Trimester, WeekMilestone } from "./types";

/**
 * Display helpers for the pregnancy visuals (no calculation logic of the tool is changed here).
 * Gestational age (GA) is counted in days from the first day of the last menstrual period (LMP);
 * the due date is LMP + 280 days (Naegele). The calculator's own week table is read back through
 * the tool itself, one call per week, so the cards never copy its numbers.
 */
export const FULL_TERM = 280;
export const MAX_GA = FULL_TERM + 21;
export const DAY_MS = 86_400_000;
export const clampGa = (d: number) => Math.min(MAX_GA, Math.max(0, d));

const tool = new PregnancyTool();

export type PregSnapshot = {
  lmp: string;
  today: string;
  ga: number;
  weeks: number;
  days: number;
  /** ACOG trimester (< 14 w, < 28 w, else 3). */
  trimester: Trimester;
  due: string;
  daysUntilDue: number;
  percent: number;
  milestone: WeekMilestone | null;
};

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** Calendar-day difference b − a (DST-safe). */
export function diffDays(a: string, b: string): number {
  const A = parseISO(a);
  const B = parseISO(b);
  return Math.round((Date.UTC(B.getFullYear(), B.getMonth(), B.getDate()) - Date.UTC(A.getFullYear(), A.getMonth(), A.getDate())) / DAY_MS);
}

/** Naegele's original calendar form: LMP + 1 year − 3 months + 7 days. */
export function naegeleISO(lmp: string): string {
  const d = parseISO(lmp);
  const out = new Date(d.getFullYear() + 1, d.getMonth() - 3, d.getDate());
  out.setDate(out.getDate() + 7);
  return toISO(out);
}

export function snapshotOf(lmp: string, today: string, data: PregnancyResult): PregSnapshot {
  const ga = data.gestationalAgeWeeks * 7 + data.gestationalAgeDays;
  return {
    lmp,
    today,
    ga,
    weeks: data.gestationalAgeWeeks,
    days: data.gestationalAgeDays,
    trimester: data.trimester,
    due: data.dueDateISO,
    daysUntilDue: data.daysUntilDue,
    percent: data.percentComplete,
    milestone: data.currentWeekMilestone,
  };
}

/** The calculator's week table (weeks 4–40), read through the tool. */
export const GROWTH: WeekMilestone[] = (() => {
  const base = "2025-01-01";
  const out: WeekMilestone[] = [];
  for (let w = 4; w <= 40; w++) {
    const r = tool.execute({ lastPeriodDate: base, referenceDate: addDaysISO(base, w * 7) }, { locale: "en-US" }).data;
    if (r?.currentWeekMilestone) out.push(r.currentWeekMilestone);
  }
  return out;
})();

export const milestoneFor = (week: number): WeekMilestone | null => GROWTH.find((m) => m.week === Math.min(40, week)) ?? null;

// ── Conventions (ACOG / WHO) ─────────────────────────────────────────────────────────────
/** ACOG trimesters in GA days: 0–13w6d, 14w0d–27w6d, 28w0d+. */
export const ACOG_TRI: { n: Trimester; from: number; to: number }[] = [
  { n: 1, from: 0, to: 98 },
  { n: 2, from: 98, to: 196 },
  { n: 3, from: 196, to: FULL_TERM },
];
export const acogTrimester = (ga: number): Trimester => (ga < 98 ? 1 : ga < 196 ? 2 : 3);

export const TRI_COLORS: Record<Trimester, string> = { 1: "#ec4899", 2: "#a855f7", 3: "#6366f1" };

/** ACOG Committee Opinion 579 (2013) term definitions, GA days. */
export type TermKey = "preterm" | "earlyTerm" | "fullTerm" | "lateTerm" | "postTerm";
export const TERMS: { key: TermKey; from: number; to: number; color: string }[] = [
  { key: "preterm", from: 0, to: 259, color: "#f59e0b" },
  { key: "earlyTerm", from: 259, to: 273, color: "#84cc16" },
  { key: "fullTerm", from: 273, to: 287, color: "#10b981" },
  { key: "lateTerm", from: 287, to: 294, color: "#06b6d4" },
  { key: "postTerm", from: 294, to: 330, color: "#ef4444" },
];
export const termOf = (ga: number): (typeof TERMS)[number] => TERMS.find((z) => ga < z.to) ?? TERMS[TERMS.length - 1];

/** Timeline stations (GA days). Typical windows from ACOG/WHO antenatal guidance. */
export type StationKey = "conception" | "heartbeat" | "endT1" | "anatomy" | "viability" | "startT3" | "earlyTerm" | "fullTerm" | "due" | "postTerm";
export const STATIONS: { key: StationKey; at: number }[] = [
  { key: "conception", at: 14 },
  { key: "heartbeat", at: 42 },
  { key: "endT1", at: 97 },
  { key: "anatomy", at: 140 },
  { key: "viability", at: 168 },
  { key: "startT3", at: 196 },
  { key: "earlyTerm", at: 259 },
  { key: "fullTerm", at: 273 },
  { key: "due", at: 280 },
  { key: "postTerm", at: 294 },
];

/** IOM (2009) gestational weight gain by pre-pregnancy BMI, as adopted by ACOG. */
export type GainKey = "under" | "normal" | "over" | "obese";
export const GAIN: { key: GainKey; bmi: [number, number]; total: [number, number]; weekly: [number, number]; color: string }[] = [
  { key: "under", bmi: [0, 18.5], total: [12.5, 18], weekly: [0.44, 0.58], color: "#38bdf8" },
  { key: "normal", bmi: [18.5, 25], total: [11.5, 16], weekly: [0.35, 0.5], color: "#10b981" },
  { key: "over", bmi: [25, 30], total: [7, 11.5], weekly: [0.23, 0.33], color: "#f59e0b" },
  { key: "obese", bmi: [30, 99], total: [5, 9], weekly: [0.17, 0.27], color: "#ef4444" },
];
/** First-trimester total gain assumed by the IOM tables: 0.5–2 kg by 13 weeks (linear before). */
const T1_GAIN: [number, number] = [0.5, 2];
export const gainKeyOf = (bmi: number): GainKey => (bmi < 18.5 ? "under" : bmi < 25 ? "normal" : bmi < 30 ? "over" : "obese");
export function gainRange(key: GainKey, gaDays: number): [number, number] {
  const g = GAIN.find((x) => x.key === key)!;
  const w = gaDays / 7;
  if (w <= 13) return [(T1_GAIN[0] * w) / 13, (T1_GAIN[1] * w) / 13];
  const after = Math.min(w, 40) - 13;
  return [T1_GAIN[0] + g.weekly[0] * after, T1_GAIN[1] + g.weekly[1] * after];
}

/**
 * Standard low-risk prenatal visit schedule (ACOG / AAP Guidelines for Perinatal Care): a first
 * visit at about 8 weeks, then every 4 weeks to 28, every 2 weeks to 36, weekly to 40.
 */
export const VISIT_WEEKS: number[] = [8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40];
export const visitInterval = (week: number) => (week < 28 ? 4 : week < 36 ? 2 : 1);

/**
 * Illustrative spread of spontaneous births around the due date: a normal curve with SD 10 days
 * (≈ 4% on the due date itself). An approximation for display, labelled on the page.
 */
export const BIRTH_SD = 10;
export function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
export const normPdf = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);

/** Typical uterus length (cm) by GA week: about 7.5 cm before pregnancy, fundus near 35 cm at term. */
const UTERUS: [number, number][] = [
  [0, 7.5],
  [12, 12],
  [20, 20],
  [28, 28],
  [36, 34],
  [40, 35],
  [43, 35],
];
export function uterusCm(week: number): number {
  for (let i = 1; i < UTERUS.length; i++) {
    const [w1, c1] = UTERUS[i];
    const [w0, c0] = UTERUS[i - 1];
    if (week <= w1) return c0 + ((week - w0) / (w1 - w0)) * (c1 - c0);
  }
  return 35;
}

// ── Formatting ───────────────────────────────────────────────────────────────────────────
/** "10w 3d" (Latin units, like the other health cards). */
export const wd = (ga: number) => `${Math.floor(ga / 7)}w ${((ga % 7) + 7) % 7}d`;
export const sgn = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

/** Localized date with Western digits (same digit convention as the indicator cards). */
export function fmtDate(iso: string, locale: string, short = false): string {
  if (!iso) return "";
  const opts: Intl.DateTimeFormatOptions = short ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" };
  return parseISO(iso).toLocaleDateString(`${locale}-u-nu-latn`, opts);
}
