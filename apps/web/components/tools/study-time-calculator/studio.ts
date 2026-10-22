"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import {
  addDaysIso,
  DEFAULT_POMODORO,
  isoToDayNumber,
  planStudy,
  pomodoroForFocus,
  sanitizePomodoro,
  type PomodoroSettings,
  type StudyPlanResult,
} from "@tooloralabs/tools";

export type StudioExam = {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  date: string;
  difficulty: number;
  credits: number;
  topics: number;
  hours: number;
};

export type StudioState = {
  v: 1;
  /** First planning day, YYYY-MM-DD. */
  start: string;
  /** Focus hours per weekday, Monday first. */
  weekly: number[];
  exams: StudioExam[];
  pomodoro: PomodoroSettings;
};

export const MAX_EXAMS = 8;
const STORAGE_KEY = "tooloralabs:study-planner:v1";

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** Today's local calendar date as YYYY-MM-DD. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Realistic sample: a student with four exams over the next 16 days (one hard, high-credit
 * chemistry exam in the middle), a lighter Friday and a longer weekend, and the classic 25/5/15
 * Pomodoro rhythm. Subject names come from translations (`studio.sample.exams`).
 */
export function sampleState(names: string[], start = todayIso()): StudioState {
  const base: Omit<StudioExam, "id" | "name" | "date">[] = [
    { difficulty: 3, credits: 4, topics: 6, hours: 8 },
    { difficulty: 5, credits: 4, topics: 8, hours: 14 },
    { difficulty: 4, credits: 3, topics: 7, hours: 12 },
    { difficulty: 2, credits: 2, topics: 5, hours: 6 },
  ];
  const offsets = [4, 8, 12, 16];
  return {
    v: 1,
    start,
    weekly: [3, 3, 3, 3, 2, 5, 4],
    exams: base.map((b, i) => ({ ...b, id: `sample-${i + 1}`, name: names[i] ?? `#${i + 1}`, date: addDaysIso(start, offsets[i]) })),
    pomodoro: { ...DEFAULT_POMODORO },
  };
}

function isValidState(x: unknown): x is StudioState {
  if (!x || typeof x !== "object") return false;
  const s = x as StudioState;
  return (
    s.v === 1 &&
    typeof s.start === "string" &&
    isoToDayNumber(s.start) !== null &&
    Array.isArray(s.weekly) &&
    s.weekly.length === 7 &&
    Array.isArray(s.exams) &&
    s.exams.every((e) => e && typeof e.date === "string" && typeof e.hours === "number") &&
    !!s.pomodoro &&
    typeof s.pomodoro.workMinutes === "number"
  );
}

/** Planner state remembered per visitor (localStorage in try/catch; the page works without it). */
export function useStudioState(initial: () => StudioState) {
  const [state, setState] = useState<StudioState>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of the visitor's saved state
        if (isValidState(parsed) && parsed.exams.length > 0) setState(parsed);
      }
    } catch {
      /* storage unavailable: keep the sample */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable or full */
    }
  }, [state]);

  return [state, setState] as const;
}

export function runPlan(state: StudioState, extraHoursPerDay = 0): StudyPlanResult {
  return planStudy({
    startDate: state.start,
    weeklyHours: state.weekly.map((h) => Math.max(0, h + extraHoursPerDay)),
    exams: state.exams.map((e) => ({ id: e.id, name: e.name, date: e.date, difficulty: e.difficulty, credits: e.credits, topics: e.topics, targetHours: e.hours })),
  });
}

export type Derived = {
  plan: StudyPlanResult;
  /** Pomodoro layout of every planned day. */
  pomodoroDays: ReturnType<typeof pomodoroForFocus>[];
  pomodoroTotals: { pomodoros: number; focus: number; short: number; long: number; shortMinutes: number; longMinutes: number; wall: number };
  colorOf: (id: string) => string;
  nameOf: (id: string) => string;
};

export function useDerived(state: StudioState): Derived {
  return useMemo(() => {
    const plan = runPlan(state);
    const p = sanitizePomodoro(state.pomodoro);
    const pomodoroDays = plan.days.map((d) => pomodoroForFocus(d.usedMinutes, p));
    const pomodoroTotals = pomodoroDays.reduce(
      (a, s) => ({
        pomodoros: a.pomodoros + s.pomodoros,
        focus: a.focus + s.focusMinutes,
        short: a.short + s.shortBreaks,
        long: a.long + s.longBreaks,
        shortMinutes: a.shortMinutes + s.shortBreaks * p.shortBreakMinutes,
        longMinutes: a.longMinutes + s.longBreaks * p.longBreakMinutes,
        wall: a.wall + s.wallMinutes,
      }),
      { pomodoros: 0, focus: 0, short: 0, long: 0, shortMinutes: 0, longMinutes: 0, wall: 0 },
    );
    const idx = new Map(state.exams.map((e, i) => [e.id, i]));
    return {
      plan,
      pomodoroDays,
      pomodoroTotals,
      colorOf: (id: string) => EXAM_COLORS[(idx.get(id) ?? 0) % EXAM_COLORS.length],
      nameOf: (id: string) => {
        const i = idx.get(id) ?? 0;
        return state.exams[i]?.name.trim() || `#${i + 1}`;
      },
    };
  }, [state]);
}

export const EXAM_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9", "#ec4899", "#14b8a6"];
export const BREAK_COLORS = { work: "#2563eb", short: "#10b981", long: "#f59e0b" } as const;

export const fmt = (v: number, digits = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: digits });

/** Locale-aware formatters: hours, dates and weekdays (Latin digits, like the rest of the site). */
export function useFmt() {
  const locale = useLocale();
  const t = useTranslations("tools.study-time-calculator.studio");
  return useMemo(() => {
    const loc = `${locale}-u-nu-latn`;
    const dayFmt = new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    const shortFmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" });
    const wdFmt = new Intl.DateTimeFormat(loc, { weekday: "short", timeZone: "UTC" });
    const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
    return {
      n: fmt,
      /** Minutes shown as hours, e.g. "2.25 h". */
      h: (minutes: number, digits = 2) => `${fmt(minutes / 60, digits)} ${t("units.h")}`,
      min: (minutes: number) => `${fmt(minutes)} ${t("units.min")}`,
      pct: (ratio: number, digits = 0) => `${fmt(ratio * 100, digits)}%`,
      day: (iso: string) => dayFmt.format(toDate(iso)),
      short: (iso: string) => shortFmt.format(toDate(iso)),
      /** Weekday name, 0 = Monday. 2024-01-01 was a Monday. */
      weekday: (i: number) => wdFmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
    };
  }, [locale, t]);
}

export type Fmt = ReturnType<typeof useFmt>;

export function useStudyT() {
  return useTranslations("tools.study-time-calculator.studio");
}
