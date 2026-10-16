import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type StudyTimeCalculatorInput = {
  totalMinutes: number;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosBeforeLongBreak: number;
};

export type StudyTimeCalculatorError =
  | "invalid-total-minutes"
  | "invalid-work-minutes"
  | "invalid-break-minutes"
  | "invalid-cycle-length"
  | "session-too-short";

export type StudyTimeCalculatorOutput = {
  error: StudyTimeCalculatorError | null;
  completedPomodoros: number;
  shortBreaksTaken: number;
  longBreaksTaken: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  leftoverMinutes: number;
  scheduledMinutes: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Simulates a Pomodoro-style study session minute by minute at the
 * granularity of whole work/break blocks: a pomodoro is only counted once its
 * full work block fits in the remaining time, and a break is only taken
 * (and counted) if it also fully fits — a session that runs out of time
 * mid-break still keeps the pomodoro that preceded it.
 */
export class StudyTimeCalculator extends BaseCalculator<StudyTimeCalculatorInput, StudyTimeCalculatorOutput> {
  metadata = {
    id: "study-time-calculator",
    slug: "study-time-calculator",
    name: "Study Time / Pomodoro Calculator",
    category: "calculators",
    description:
      "Plan a study or work session using the Pomodoro Technique: see how many focus intervals and breaks fit in the time you have.",
    version: "1.0.0",
  };

  execute(input: StudyTimeCalculatorInput, _context: ToolContext): ToolResult<StudyTimeCalculatorOutput> {
    const { totalMinutes, workMinutes, shortBreakMinutes, longBreakMinutes, pomodorosBeforeLongBreak } = input;

    if (!(totalMinutes > 0)) return this.errorResult("invalid-total-minutes");
    if (!(workMinutes > 0)) return this.errorResult("invalid-work-minutes");
    if (shortBreakMinutes < 0 || longBreakMinutes < 0) return this.errorResult("invalid-break-minutes");
    if (!(pomodorosBeforeLongBreak >= 1) || !Number.isFinite(pomodorosBeforeLongBreak)) {
      return this.errorResult("invalid-cycle-length");
    }
    if (totalMinutes < workMinutes) return this.errorResult("session-too-short");

    const cycleLength = Math.max(1, Math.round(pomodorosBeforeLongBreak));

    let remaining = totalMinutes;
    let completedPomodoros = 0;
    let shortBreaksTaken = 0;
    let longBreaksTaken = 0;
    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;

    while (remaining >= workMinutes) {
      remaining -= workMinutes;
      totalWorkMinutes += workMinutes;
      completedPomodoros += 1;

      const isLongBreakDue = completedPomodoros % cycleLength === 0;
      const breakLength = isLongBreakDue ? longBreakMinutes : shortBreakMinutes;

      if (breakLength > 0 && remaining >= breakLength) {
        remaining -= breakLength;
        totalBreakMinutes += breakLength;
        if (isLongBreakDue) {
          longBreaksTaken += 1;
        } else {
          shortBreaksTaken += 1;
        }
      } else if (breakLength === 0) {
        // No break configured for this slot — nothing to schedule, keep looping.
      } else {
        // Not enough time left for the break the schedule calls for; stop here.
        break;
      }
    }

    const scheduledMinutes = totalWorkMinutes + totalBreakMinutes;
    const leftoverMinutes = totalMinutes - scheduledMinutes;

    return this.ok({
      completedPomodoros,
      shortBreaksTaken,
      longBreaksTaken,
      totalWorkMinutes,
      totalBreakMinutes,
      leftoverMinutes,
      scheduledMinutes,
    });
  }

  private ok(data: Omit<StudyTimeCalculatorOutput, "error">): ToolResult<StudyTimeCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        completedPomodoros: data.completedPomodoros,
        shortBreaksTaken: data.shortBreaksTaken,
        longBreaksTaken: data.longBreaksTaken,
        totalWorkMinutes: clean(data.totalWorkMinutes),
        totalBreakMinutes: clean(data.totalBreakMinutes),
        leftoverMinutes: clean(data.leftoverMinutes),
        scheduledMinutes: clean(data.scheduledMinutes),
      },
      metadata: {},
    };
  }

  private errorResult(error: StudyTimeCalculatorError): ToolResult<StudyTimeCalculatorOutput> {
    return {
      success: true,
      data: {
        error,
        completedPomodoros: 0,
        shortBreaksTaken: 0,
        longBreaksTaken: 0,
        totalWorkMinutes: 0,
        totalBreakMinutes: 0,
        leftoverMinutes: 0,
        scheduledMinutes: 0,
      },
      metadata: {},
    };
  }
}

/* ------------------------------------------------------------------------------------------------
 * Pomodoro math + exam planner (pure, deterministic, no DOM).
 *
 * Pomodoro cadence: Francesco Cirillo, "The Pomodoro Technique" (25-minute pomodoro, 3–5 minute
 * short break, 15–30 minute long break after every 4 pomodoros).
 * Spaced reviews: expanding intervals before the exam (7, 3 and 1 day out), after Cepeda et al.
 * (2008), "Spacing effects in learning", Psychological Science 19(11), 1095–1102.
 * Forgetting model: Ebbinghaus-style exponential decay R = e^(−t/S), where every review restores
 * recall and multiplies the memory stability S (a common simplification used by SM-2 style apps).
 * ---------------------------------------------------------------------------------------------- */

export type PomodoroSettings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** A long break replaces the short one after every N pomodoros. */
  longBreakEvery: number;
};

export const DEFAULT_POMODORO: PomodoroSettings = { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakEvery: 4 };

export type PomodoroBlockKind = "work" | "short" | "long";
export type PomodoroBlock = { kind: PomodoroBlockKind; start: number; minutes: number; /** Pomodoro number (1-based) the block belongs to. */ n: number };

export type PomodoroSummary = {
  pomodoros: number;
  fullPomodoros: number;
  /** Length of the last pomodoro when the focus time is not a whole number of pomodoros (else the work length). */
  lastPomodoroMinutes: number;
  focusMinutes: number;
  shortBreaks: number;
  longBreaks: number;
  breakMinutes: number;
  /** Focus + breaks, start to finish. */
  wallMinutes: number;
  /** Focus share of the wall time, 0–1. */
  focusRatio: number;
  /** Complete long-break cycles (N pomodoros each). */
  cycles: number;
  blocks: PomodoroBlock[];
};

export function sanitizePomodoro(s: Partial<PomodoroSettings>): PomodoroSettings {
  const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  return {
    workMinutes: Math.max(1, Math.round(num(s.workMinutes, DEFAULT_POMODORO.workMinutes))),
    shortBreakMinutes: Math.max(0, Math.round(num(s.shortBreakMinutes, DEFAULT_POMODORO.shortBreakMinutes))),
    longBreakMinutes: Math.max(0, Math.round(num(s.longBreakMinutes, DEFAULT_POMODORO.longBreakMinutes))),
    longBreakEvery: Math.max(1, Math.round(num(s.longBreakEvery, DEFAULT_POMODORO.longBreakEvery))),
  };
}

function summarize(blocks: PomodoroBlock[], work: number, every: number): PomodoroSummary {
  const works = blocks.filter((b) => b.kind === "work");
  const focusMinutes = works.reduce((a, b) => a + b.minutes, 0);
  const breakMinutes = blocks.filter((b) => b.kind !== "work").reduce((a, b) => a + b.minutes, 0);
  const wallMinutes = focusMinutes + breakMinutes;
  return {
    pomodoros: works.length,
    fullPomodoros: works.filter((b) => b.minutes >= work).length,
    lastPomodoroMinutes: works.length ? works[works.length - 1].minutes : 0,
    focusMinutes,
    shortBreaks: blocks.filter((b) => b.kind === "short").length,
    longBreaks: blocks.filter((b) => b.kind === "long").length,
    breakMinutes,
    wallMinutes,
    focusRatio: wallMinutes > 0 ? focusMinutes / wallMinutes : 0,
    cycles: Math.floor(works.length / every),
    blocks,
  };
}

/**
 * Lays out a given amount of focus time as pomodoros: whole pomodoros first, the remainder as a
 * shorter last one, a break between consecutive pomodoros (long after every N-th), none at the end.
 */
export function pomodoroForFocus(focusMinutes: number, settings: Partial<PomodoroSettings> = DEFAULT_POMODORO): PomodoroSummary {
  const s = sanitizePomodoro(settings);
  const focus = Number.isFinite(focusMinutes) ? Math.max(0, Math.round(focusMinutes)) : 0;
  const n = Math.ceil(focus / s.workMinutes);
  const blocks: PomodoroBlock[] = [];
  let t = 0;
  let left = focus;
  for (let i = 1; i <= n; i++) {
    const m = Math.min(s.workMinutes, left);
    blocks.push({ kind: "work", start: t, minutes: m, n: i });
    t += m;
    left -= m;
    if (i < n) {
      const long = i % s.longBreakEvery === 0;
      const b = long ? s.longBreakMinutes : s.shortBreakMinutes;
      if (b > 0) {
        blocks.push({ kind: long ? "long" : "short", start: t, minutes: b, n: i });
        t += b;
      }
    }
  }
  return summarize(blocks, s.workMinutes, s.longBreakEvery);
}

/** How many whole pomodoros (with their breaks in between) fit in a wall-clock window. */
export function pomodoroInWindow(
  windowMinutes: number,
  settings: Partial<PomodoroSettings> = DEFAULT_POMODORO,
): PomodoroSummary & { leftoverMinutes: number } {
  const s = sanitizePomodoro(settings);
  const win = Number.isFinite(windowMinutes) ? Math.max(0, windowMinutes) : 0;
  const blocks: PomodoroBlock[] = [];
  let t = 0;
  let i = 0;
  for (;;) {
    const breakBefore = i === 0 ? 0 : i % s.longBreakEvery === 0 ? s.longBreakMinutes : s.shortBreakMinutes;
    if (t + breakBefore + s.workMinutes > win) break;
    if (breakBefore > 0) {
      blocks.push({ kind: i % s.longBreakEvery === 0 ? "long" : "short", start: t, minutes: breakBefore, n: i });
      t += breakBefore;
    }
    i += 1;
    blocks.push({ kind: "work", start: t, minutes: s.workMinutes, n: i });
    t += s.workMinutes;
  }
  return { ...summarize(blocks, s.workMinutes, s.longBreakEvery), leftoverMinutes: win - t };
}

/* ---------- ISO date helpers (UTC calendar days, no time zones involved) ---------- */

const DAY_MS = 86_400_000;

export function isoToDayNumber(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(ms);
  if (d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) return null;
  return Math.round(ms / DAY_MS);
}

export function dayNumberToIso(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, n: number): string {
  const d = isoToDayNumber(iso);
  return d === null ? iso : dayNumberToIso(d + n);
}

/** Days from `a` to `b` (positive when `b` is later), or null for an invalid date. */
export function daysBetweenIso(a: string, b: string): number | null {
  const x = isoToDayNumber(a);
  const y = isoToDayNumber(b);
  return x === null || y === null ? null : y - x;
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayMondayFirst(iso: string): number {
  const d = isoToDayNumber(iso) ?? 0;
  // 1970-01-01 (day 0) was a Thursday (index 3).
  return (((d + 3) % 7) + 7) % 7;
}

/* ---------- Exam planner ---------- */

/** Planning granularity: 15-minute blocks. */
export const STUDY_UNIT_MINUTES = 15;
/** Days before the exam on which a spaced review is booked (expanding intervals). */
export const DEFAULT_REVIEW_OFFSETS = [7, 3, 1];
/** Share of an exam's target hours used by each review session. */
export const DEFAULT_REVIEW_SHARE = 0.1;
/** The free time of a day is shared by at most this many subjects (reviews and urgent work excepted). */
export const MAX_SUBJECTS_PER_DAY = 2;

export type StudyExamInput = {
  id: string;
  name?: string;
  /** Exam date, YYYY-MM-DD. */
  date: string;
  /** 1 (easy) … 5 (hard). */
  difficulty: number;
  /** Credit hours / importance, 1 … 10. */
  credits: number;
  /** Number of topics to cover. */
  topics: number;
  /** Study hours the student wants for this exam (learning + reviews). */
  targetHours: number;
};

export type StudyPlanInput = {
  /** First planning day (usually today), YYYY-MM-DD. */
  startDate: string;
  /** Focus hours available on each weekday, Monday first (7 values). */
  weeklyHours: number[];
  exams: StudyExamInput[];
  reviewOffsets?: number[];
  reviewShare?: number;
};

export type StudySessionKind = "learn" | "review";
export type StudySession = { examId: string; kind: StudySessionKind; minutes: number };

export type StudyPlanDay = {
  index: number;
  date: string;
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  /** Raw availability for the weekday. */
  capacityMinutes: number;
  /** Availability that some exam can still use (0 on and after the last exam day). */
  usableMinutes: number;
  sessions: StudySession[];
  usedMinutes: number;
  freeMinutes: number;
  examIds: string[];
};

export type StudyExamStatus = "upcoming" | "today" | "past" | "invalid";

export type StudyExamPlan = {
  id: string;
  name: string;
  status: StudyExamStatus;
  /** Day index of the exam (0 = start date). */
  examIndex: number;
  daysLeft: number;
  difficulty: number;
  credits: number;
  topics: number;
  /** difficulty × credits. */
  weight: number;
  /** 1 + 7 / max(1, days left), at the start date. */
  urgency: number;
  /** weight × urgency, at the start date. */
  priority: number;
  targetMinutes: number;
  reviewEachMinutes: number;
  reviewTargetMinutes: number;
  learnTargetMinutes: number;
  learnMinutes: number;
  reviewMinutes: number;
  plannedMinutes: number;
  shortfallMinutes: number;
  /** planned / target, 0–1 (1 when the target is 0). */
  coverage: number;
  /** Topics covered by the planned learning time. */
  topicsCovered: number;
  /** Day indices of the booked reviews (soonest first). */
  reviewDays: number[];
  /** Day indices with any study for this exam. */
  studyDays: number[];
  /** Usable capacity on the days before the exam (shared with the other exams). */
  capacityBeforeMinutes: number;
};

export type StudyPlanTotals = {
  horizonDays: number;
  capacityMinutes: number;
  requiredMinutes: number;
  plannedMinutes: number;
  /** Unused usable capacity (overflow / buffer). */
  freeMinutes: number;
  shortfallMinutes: number;
  /** required / capacity (Infinity when there is demand but no capacity). */
  loadRatio: number;
  feasible: boolean;
  /** Day index with the most planned study, or -1. */
  peakDay: number;
  studyDays: number;
};

export type StudyPlanResult = { days: StudyPlanDay[]; exams: StudyExamPlan[]; totals: StudyPlanTotals };

export function studyUrgency(daysLeft: number): number {
  return 1 + 7 / Math.max(1, daysLeft);
}

const clampInt = (v: number, lo: number, hi: number, d: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d);
const toUnits = (minutes: number) => Math.max(0, Math.round(minutes / STUDY_UNIT_MINUTES));

/** Splits `total` units by weight with per-item caps (water-filling, largest remainder, stable order). */
function splitUnits(total: number, items: { key: string; weight: number; cap: number }[]): Map<string, number> {
  const given = new Map(items.map((i) => [i.key, 0]));
  let left = total;
  for (let guard = 0; left > 0 && guard < 64; guard++) {
    const open = items.filter((i) => (given.get(i.key) ?? 0) < i.cap && i.weight > 0);
    if (!open.length) break;
    const w = open.reduce((a, i) => a + i.weight, 0);
    const raw = open.map((i) => ({ i, share: (left * i.weight) / w }));
    const alloc = raw.map((r) => ({ ...r, units: Math.floor(r.share) }));
    let rest = left - alloc.reduce((a, r) => a + r.units, 0);
    [...alloc]
      .map((r, idx) => ({ r, idx }))
      .sort((a, b) => b.r.share - b.r.units - (a.r.share - a.r.units) || a.idx - b.idx)
      .forEach(({ r }) => {
        if (rest > 0) {
          r.units += 1;
          rest -= 1;
        }
      });
    let assigned = 0;
    for (const r of alloc) {
      const room = r.i.cap - (given.get(r.i.key) ?? 0);
      const take = Math.min(room, r.units);
      given.set(r.i.key, (given.get(r.i.key) ?? 0) + take);
      assigned += take;
    }
    if (assigned === 0) break;
    left -= assigned;
  }
  return given;
}

/**
 * Builds a day-by-day plan from the start date to the last exam:
 * 1. each exam's target is split into spaced reviews (booked on their exact days, 7/3/1 days
 *    before the exam) and learning time;
 * 2. every day, reviews due that day are booked first; then learning that cannot wait (earliest
 *    deadline first: the demand of all exams due by a date must fit before that date) is booked;
 * 3. the rest of the day is shared by priority = difficulty × credits × urgency(days left);
 * 4. no exam is studied on or after its date; anything that does not fit is reported as shortfall
 *    and unused capacity as free buffer.
 */
export function planStudy(input: StudyPlanInput): StudyPlanResult {
  const start = isoToDayNumber(input.startDate) ?? 0;
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const h = input.weeklyHours[i];
    return typeof h === "number" && Number.isFinite(h) ? Math.min(24, Math.max(0, h)) : 0;
  });
  const offsets = Array.from(new Set((input.reviewOffsets ?? DEFAULT_REVIEW_OFFSETS).filter((o) => Number.isFinite(o) && o >= 1).map(Math.round))).sort((a, b) => b - a);
  const share = Math.min(0.5, Math.max(0, input.reviewShare ?? DEFAULT_REVIEW_SHARE));

  type Work = StudyExamPlan & { reviewEachUnits: number; learnRemUnits: number; reviewDue: Map<number, number> };
  const exams: Work[] = input.exams.map((e, i) => {
    const day = isoToDayNumber(e.date);
    const examIndex = day === null ? -1 : day - start;
    const status: StudyExamStatus = day === null ? "invalid" : examIndex < 0 ? "past" : examIndex === 0 ? "today" : "upcoming";
    const difficulty = clampInt(e.difficulty, 1, 5, 3);
    const credits = clampInt(e.credits, 1, 10, 3);
    const topics = clampInt(e.topics, 0, 999, 0);
    const targetUnits = toUnits(Math.max(0, Number.isFinite(e.targetHours) ? e.targetHours : 0) * 60);
    const daysLeft = Math.max(0, examIndex);
    const urgency = studyUrgency(daysLeft);
    // A review needs some learning first: the eve-of-exam review from day 1, earlier ones from day 2.
    const minOffset = offsets.length ? offsets[offsets.length - 1] : 0;
    const possible = status === "upcoming" ? offsets.filter((o) => examIndex - o >= (o === minOffset ? 1 : 2)) : [];
    const reviewEachUnits = targetUnits > 0 ? Math.max(1, Math.round(targetUnits * share)) : 0;
    const reviewCount = reviewEachUnits > 0 ? Math.min(possible.length, Math.floor(targetUnits / reviewEachUnits)) : 0;
    const reviewDays = possible.slice(0, reviewCount).map((o) => examIndex - o);
    const learnTargetUnits = targetUnits - reviewCount * reviewEachUnits;
    return {
      id: e.id || `exam-${i + 1}`,
      name: e.name ?? "",
      status,
      examIndex,
      daysLeft,
      difficulty,
      credits,
      topics,
      weight: difficulty * credits,
      urgency,
      priority: difficulty * credits * urgency,
      targetMinutes: targetUnits * STUDY_UNIT_MINUTES,
      reviewEachMinutes: reviewEachUnits * STUDY_UNIT_MINUTES,
      reviewTargetMinutes: reviewCount * reviewEachUnits * STUDY_UNIT_MINUTES,
      learnTargetMinutes: learnTargetUnits * STUDY_UNIT_MINUTES,
      learnMinutes: 0,
      reviewMinutes: 0,
      plannedMinutes: 0,
      shortfallMinutes: 0,
      coverage: 0,
      topicsCovered: 0,
      reviewDays,
      studyDays: [],
      capacityBeforeMinutes: 0,
      reviewEachUnits,
      learnRemUnits: status === "upcoming" ? learnTargetUnits : 0,
      reviewDue: new Map(reviewDays.map((d) => [d, reviewEachUnits])),
    };
  });

  const upcoming = exams.filter((e) => e.status === "upcoming");
  const visible = exams.filter((e) => e.status === "upcoming" || e.status === "today");
  const lastIndex = visible.reduce((a, e) => Math.max(a, e.examIndex), -1);
  const nDays = lastIndex + 1;
  const capUnits = Array.from({ length: nDays }, (_, d) => Math.floor((weekly[(((start + d + 3) % 7) + 7) % 7] * 60) / STUDY_UNIT_MINUTES));
  const usableUnits = capUnits.map((c, d) => (upcoming.some((e) => e.examIndex > d) ? c : 0));
  const reviewLoad = Array.from({ length: nDays }, (_, d) => exams.reduce((a, e) => a + (e.reviewDue.get(d) ?? 0), 0));
  const freeAfterReviews = usableUnits.map((u, d) => Math.max(0, u - reviewLoad[d]));
  const prefix = [0];
  freeAfterReviews.forEach((f, d) => prefix.push(prefix[d] + f));
  const futureFree = (from: number, toExclusive: number) => (toExclusive > from ? prefix[toExclusive] - prefix[from] : 0);

  const days: StudyPlanDay[] = [];
  const edf = [...upcoming].sort((a, b) => a.examIndex - b.examIndex || a.id.localeCompare(b.id));
  for (let d = 0; d < nDays; d++) {
    let free = usableUnits[d];
    const sessions: StudySession[] = [];
    const book = (e: Work, kind: StudySessionKind, units: number) => {
      if (units <= 0) return;
      const ex = sessions.find((s) => s.examId === e.id && s.kind === kind);
      if (ex) ex.minutes += units * STUDY_UNIT_MINUTES;
      else sessions.push({ examId: e.id, kind, minutes: units * STUDY_UNIT_MINUTES });
      if (kind === "learn") {
        e.learnRemUnits -= units;
        e.learnMinutes += units * STUDY_UNIT_MINUTES;
      } else e.reviewMinutes += units * STUDY_UNIT_MINUTES;
      if (!e.studyDays.includes(d)) e.studyDays.push(d);
      free -= units;
    };

    // 1. Reviews due today.
    for (const e of edf) {
      const due = e.reviewDue.get(d) ?? 0;
      if (due > 0) book(e, "review", Math.min(due, free));
    }
    // 2. Learning that cannot wait (cumulative earliest-deadline demand).
    const active = edf.filter((e) => e.examIndex > d && e.learnRemUnits > 0);
    let cumDemand = 0;
    let cumMust = 0;
    const must = new Map<string, number>();
    for (const e of active) {
      cumDemand += e.learnRemUnits;
      const need = Math.max(0, cumDemand - futureFree(d + 1, e.examIndex) - cumMust);
      const take = Math.min(need, e.learnRemUnits, free - [...must.values()].reduce((a, v) => a + v, 0));
      if (take > 0) must.set(e.id, take);
      cumMust += Math.max(0, take);
    }
    for (const e of active) book(e, "learn", must.get(e.id) ?? 0);
    // 3. Share the rest by priority among the top subjects of the day (fewer, longer sessions).
    for (let guard = 0; free > 0 && guard < 16; guard++) {
      const open = active
        .filter((e) => e.learnRemUnits > 0)
        .map((e) => ({ e, p: e.difficulty * e.credits * studyUrgency(e.examIndex - d) }))
        .sort((a, b) => b.p - a.p || a.e.examIndex - b.e.examIndex)
        .slice(0, MAX_SUBJECTS_PER_DAY);
      if (!open.length) break;
      const split = splitUnits(free, open.map(({ e, p }) => ({ key: e.id, weight: p, cap: e.learnRemUnits })));
      for (const { e } of open) book(e, "learn", split.get(e.id) ?? 0);
    }
    const used = sessions.reduce((a, s) => a + s.minutes, 0);
    days.push({
      index: d,
      date: dayNumberToIso(start + d),
      weekday: (((start + d + 3) % 7) + 7) % 7,
      capacityMinutes: capUnits[d] * STUDY_UNIT_MINUTES,
      usableMinutes: usableUnits[d] * STUDY_UNIT_MINUTES,
      sessions,
      usedMinutes: used,
      freeMinutes: usableUnits[d] * STUDY_UNIT_MINUTES - used,
      examIds: visible.filter((e) => e.examIndex === d).map((e) => e.id),
    });
  }

  for (const e of exams) {
    e.plannedMinutes = e.learnMinutes + e.reviewMinutes;
    e.shortfallMinutes = Math.max(0, e.targetMinutes - e.plannedMinutes);
    e.coverage = e.targetMinutes > 0 ? e.plannedMinutes / e.targetMinutes : 1;
    e.topicsCovered = e.learnTargetMinutes > 0 ? Math.min(e.topics, Math.floor((e.learnMinutes / e.learnTargetMinutes) * e.topics + 1e-9)) : e.status === "upcoming" ? e.topics : 0;
    e.capacityBeforeMinutes = e.status === "upcoming" ? usableUnits.slice(0, e.examIndex).reduce((a, u) => a + u, 0) * STUDY_UNIT_MINUTES : 0;
    e.studyDays.sort((a, b) => a - b);
  }

  const counted = exams.filter((e) => e.status === "upcoming" || e.status === "today");
  const capacityMinutes = usableUnits.reduce((a, u) => a + u, 0) * STUDY_UNIT_MINUTES;
  const requiredMinutes = counted.reduce((a, e) => a + e.targetMinutes, 0);
  const plannedMinutes = days.reduce((a, d) => a + d.usedMinutes, 0);
  const shortfallMinutes = counted.reduce((a, e) => a + e.shortfallMinutes, 0);
  const peak = days.reduce((best, d) => (d.usedMinutes > (best >= 0 ? days[best].usedMinutes : 0) ? d.index : best), -1);

  return {
    days,
    exams: exams.map(({ reviewEachUnits: _a, learnRemUnits: _b, reviewDue: _c, ...rest }) => rest),
    totals: {
      horizonDays: nDays,
      capacityMinutes,
      requiredMinutes,
      plannedMinutes,
      freeMinutes: capacityMinutes - plannedMinutes,
      shortfallMinutes,
      loadRatio: capacityMinutes > 0 ? requiredMinutes / capacityMinutes : requiredMinutes > 0 ? Infinity : 0,
      feasible: shortfallMinutes === 0,
      peakDay: peak,
      studyDays: days.filter((d) => d.usedMinutes > 0).length,
    },
  };
}

export type RetentionPoint = { t: number; r: number };

/**
 * Ebbinghaus-style recall curve R = e^(−(t − last review) / S): learning at `learnDay`, each review
 * resets recall to 100% and multiplies stability S by `growth`. Returns samples from the learn day
 * to `endDay` plus recall at `endDay`.
 */
export function retentionCurve(opts: {
  learnDay: number;
  reviewDays: number[];
  endDay: number;
  baseStability?: number;
  growth?: number;
  stepsPerDay?: number;
}): { points: RetentionPoint[]; atEnd: number; stabilityAtEnd: number } {
  const S0 = opts.baseStability ?? 1.5;
  const g = opts.growth ?? 2.5;
  const steps = Math.max(1, Math.round(opts.stepsPerDay ?? 4));
  const reviews = opts.reviewDays.filter((d) => d > opts.learnDay && d <= opts.endDay).sort((a, b) => a - b);
  const at = (t: number) => {
    let last = opts.learnDay;
    let S = S0;
    for (const r of reviews) {
      if (r <= t) {
        last = r;
        S *= g;
      }
    }
    return { r: Math.exp(-(t - last) / S), S };
  };
  const points: RetentionPoint[] = [];
  const span = Math.max(0, opts.endDay - opts.learnDay);
  for (let k = 0; k <= span * steps; k++) {
    const t = opts.learnDay + k / steps;
    points.push({ t, r: at(t).r });
    // Show the drop just before each review jump.
    if (reviews.some((r) => Math.abs(r - (t + 1 / steps)) < 1e-9)) points.push({ t: t + 1 / steps - 1e-6, r: at(t + 1 / steps - 1e-6).r });
  }
  const end = at(opts.endDay);
  return { points, atEnd: end.r, stabilityAtEnd: end.S };
}
