"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  buildTimeline,
  convertSaudiGpa,
  GPA_SCALES,
  gradeForLetter,
  gradeForPercent,
  honorsStanding,
  mapLetterToScale,
  planTarget,
  type GpaCourse,
  type GpaRetakePolicy,
  type GpaScaleId,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";

export type EntryMode = "letter" | "percent";

export type PlannerCourse = { id: string; name: string; credits: string; letter: string; percent: string };
export type PlannerSemester = { id: string; courses: PlannerCourse[] };

export type PlannerState = {
  v: 1;
  scale: GpaScaleId;
  entry: EntryMode;
  priorGpa: string;
  priorCredits: string;
  semesters: PlannerSemester[];
  target: string;
  plannedCredits: string;
  retakePolicy: GpaRetakePolicy;
};

const STORAGE_KEY = "tooloralabs:gpa-planner:v1";

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/**
 * Realistic sample: a KSU-style student after one year (34 credits, 4.12 on 5.00) with two
 * further semesters of real-looking course loads, so the page shows a full result on load.
 * Names come from translations (`planner.sample.courses`).
 */
const SAMPLE: { credits: string; letter: string; percent: string }[][] = [
  [
    { credits: "4", letter: "A", percent: "91" },
    { credits: "4", letter: "B+", percent: "86" },
    { credits: "3", letter: "A+", percent: "96" },
    { credits: "2", letter: "B", percent: "82" },
    { credits: "3", letter: "C+", percent: "77" },
  ],
  [
    { credits: "4", letter: "A", percent: "93" },
    { credits: "3", letter: "B+", percent: "88" },
    { credits: "3", letter: "A+", percent: "97" },
    { credits: "3", letter: "B", percent: "81" },
    { credits: "2", letter: "A", percent: "90" },
  ],
];

export function sampleState(courseNames: string[]): PlannerState {
  let n = 0;
  return {
    v: 1,
    scale: "sa5",
    entry: "letter",
    priorGpa: "4.12",
    priorCredits: "34",
    semesters: SAMPLE.map((term) => ({
      id: newId(),
      courses: term.map((c) => ({ id: newId(), name: courseNames[n++] ?? "", ...c })),
    })),
    target: "4.50",
    plannedCredits: "15",
    retakePolicy: "average",
  };
}

export function emptyCourse(scale: GpaScaleId): PlannerCourse {
  return { id: newId(), name: "", credits: "3", letter: GPA_SCALES[scale].grades[1].letter, percent: "90" };
}

const num = (s: string) => parseLocalizedNumber(s) || 0;

/** Switching scale keeps each course's percentage band and converts GPAs where an exact rule exists. */
export function switchScale(state: PlannerState, to: GpaScaleId): PlannerState {
  const from = state.scale;
  if (from === to) return state;
  const max = GPA_SCALES[to].max;
  const conv = (s: string) => {
    const v = num(s);
    const c = convertSaudiGpa(v, from, to);
    return String(Math.min(max, c ?? v));
  };
  return {
    ...state,
    scale: to,
    priorGpa: conv(state.priorGpa),
    target: conv(state.target),
    semesters: state.semesters.map((s) => ({
      ...s,
      courses: s.courses.map((c) => ({ ...c, letter: mapLetterToScale(from, to, c.letter) })),
    })),
  };
}

export function coursePoints(state: Pick<PlannerState, "scale" | "entry">, c: PlannerCourse): number {
  return state.entry === "percent" ? gradeForPercent(state.scale, num(c.percent)).points : gradeForLetter(state.scale, c.letter).points;
}

export function courseLetter(state: Pick<PlannerState, "scale" | "entry">, c: PlannerCourse): string {
  return state.entry === "percent" ? gradeForPercent(state.scale, num(c.percent)).letter : c.letter;
}

export function toGpaCourses(state: PlannerState, s: PlannerSemester): GpaCourse[] {
  return s.courses.map((c) => ({ credits: num(c.credits), points: coursePoints(state, c) }));
}

export function derive(state: PlannerState) {
  const scale = GPA_SCALES[state.scale];
  const priorCredits = Math.max(0, num(state.priorCredits));
  const priorGpa = Math.min(scale.max, Math.max(0, num(state.priorGpa)));
  const terms = state.semesters.map((s) => toGpaCourses(state, s));
  const timeline = buildTimeline(priorGpa, priorCredits, terms);
  const last = timeline[timeline.length - 1];
  const cumulativeGpa = last ? last.cumulativeGpa : priorGpa;
  const cumulativeCredits = last ? last.cumulativeCredits : priorCredits;
  const cumulativeQualityPoints = last ? last.cumulativeQualityPoints : priorGpa * priorCredits;
  const target = Math.min(scale.max, Math.max(0, num(state.target)));
  const plannedCredits = Math.max(1, num(state.plannedCredits));
  const plan = planTarget(state.scale, cumulativeGpa, cumulativeCredits, target, plannedCredits);
  const honors = honorsStanding(state.scale, cumulativeGpa);
  const honorPlans = honors.gaps.map((g) => ({ ...g, plan: planTarget(state.scale, cumulativeGpa, cumulativeCredits, g.min, plannedCredits) }));
  return {
    scale,
    priorGpa,
    priorCredits,
    terms,
    timeline,
    last,
    cumulativeGpa,
    cumulativeCredits,
    cumulativeQualityPoints,
    target,
    plannedCredits,
    plan,
    honors,
    honorPlans,
  };
}

export type Derived = ReturnType<typeof derive>;

export function makeFormatters(digitStyle: DigitStyle) {
  return {
    gpa: (v: number) => formatLocalizedNumber(v, digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    num: (v: number, digits = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: digits }),
    signed: (v: number) =>
      `${v > 0 ? "+" : v < 0 ? "−" : "±"}${formatLocalizedNumber(Math.abs(v), digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
}

export type Formatters = ReturnType<typeof makeFormatters>;

export function stateDigitStyle(state: PlannerState): DigitStyle {
  return resolveDigitStyle(
    state.priorGpa,
    state.priorCredits,
    state.target,
    ...state.semesters.flatMap((s) => s.courses.map((c) => c.credits)),
  );
}

function isValidState(x: unknown): x is PlannerState {
  if (!x || typeof x !== "object") return false;
  const s = x as PlannerState;
  return s.v === 1 && s.scale in GPA_SCALES && Array.isArray(s.semesters) && s.semesters.every((t) => Array.isArray(t.courses));
}

/** Planner state remembered per visitor (localStorage, wrapped in try/catch; the page works without it). */
export function usePlannerState(initial: () => PlannerState) {
  const [state, setState] = useState<PlannerState>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidState(parsed)) setState(parsed);
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
      /* storage unavailable or full: nothing to persist */
    }
  }, [state]);

  return [state, setState] as const;
}

export function useDerived(state: PlannerState) {
  return useMemo(() => derive(state), [state]);
}

/** Honors zone colors (highest honor first), shared by the gauge, the zone strip and the trend chart. */
export const HONOR_COLORS = ["#10b981", "#3b82f6", "#8b5cf6"];
