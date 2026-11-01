"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatLocalizedNumber } from "@tooloralabs/core";
import {
  addDays,
  CLASS_KINDS,
  DAY_CODES,
  findClassConflicts,
  termOccurrences,
  termWeeks,
  weekdayOf,
  weeklyScheduleStats,
  type ClassKind,
  type DayCode,
  type ScheduleClass,
} from "@tooloralabs/tools";

export type StudioClass = {
  id: string;
  name: string;
  code: string;
  kind: ClassKind;
  days: DayCode[];
  /** "HH:MM", 24-hour. */
  start: string;
  end: string;
  room: string;
  instructor: string;
  credits: number;
  color: number;
};

export type StudioState = {
  v: 1;
  classes: StudioClass[];
  selectedId: string;
  /** Minimum minutes wanted between two classes (walking time). */
  buffer: number;
  termStart: string;
  termEnd: string;
  /** Optional break (no classes) exported as EXDATE. Empty strings = none. */
  breakStart: string;
  breakEnd: string;
  /** true: DTSTART;TZID=<visitor zone>; false: floating local times. */
  useTz: boolean;
  /** Round-trip commute minutes per campus day. */
  commute: number;
};

const STORAGE_KEY = "tooloralabs:class-schedule-studio:v1";

export const CLASS_COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#0ea5e9", "#f97316", "#14b8a6"];
export const classColor = (c: Pick<StudioClass, "color">) => CLASS_COLORS[((c.color % CLASS_COLORS.length) + CLASS_COLORS.length) % CLASS_COLORS.length];

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export const fmt = (v: number, digits = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: digits });

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((p) => Number.parseInt(p, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function hm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Monday of the week containing `iso`. */
function mondayOf(iso: string): string {
  return addDays(iso, -DAY_CODES.indexOf(weekdayOf(iso)));
}

type SampleText = { name: string; room: string };

/**
 * A real-looking second-year week: CS lecture + lab, linear algebra, physics lecture + lab,
 * statistics straight after physics (touching edges), technical writing, and a film elective
 * the student is still considering that overlaps the physics lab. Term = this week's Monday + 15 weeks.
 */
/** The sample term starts on the Monday of `today` (from useTodayISO, so the server and the hydrating render agree). */
export function sampleState(text: SampleText[], today: string): StudioState {
  const n = (i: number, name: string, room: string) => ({ name: text[i]?.name || name, room: text[i]?.room || room });
  const base: Omit<StudioClass, "id" | "color" | "name" | "room">[] = [
    { code: "CS 201", kind: "lecture", days: ["mon", "wed", "fri"], start: "09:00", end: "09:50", instructor: "Dr. Mei Lin", credits: 3 },
    { code: "CS 201L", kind: "lab", days: ["fri"], start: "10:00", end: "11:50", instructor: "Dr. Mei Lin", credits: 1 },
    { code: "MATH 221", kind: "lecture", days: ["tue", "thu"], start: "10:30", end: "11:45", instructor: "Prof. Ada Okafor", credits: 3 },
    { code: "PHYS 211", kind: "lecture", days: ["mon", "wed"], start: "11:00", end: "12:15", instructor: "Dr. Omar Haddad", credits: 3 },
    { code: "STAT 250", kind: "lecture", days: ["mon", "wed"], start: "12:15", end: "13:30", instructor: "Prof. Sara Weiss", credits: 3 },
    { code: "PHYS 211L", kind: "lab", days: ["thu"], start: "14:00", end: "16:50", instructor: "T. Nguyen", credits: 1 },
    { code: "ENG 205", kind: "seminar", days: ["tue"], start: "13:00", end: "15:30", instructor: "Dr. Leila Mansour", credits: 3 },
    { code: "FILM 110", kind: "seminar", days: ["thu"], start: "16:00", end: "17:15", instructor: "Prof. Diego Ruiz", credits: 3 },
  ];
  const fallback: SampleText[] = [
    { name: "Data Structures", room: "Engineering Hall 120" },
    { name: "Data Structures Lab", room: "Engineering Hall 310" },
    { name: "Linear Algebra", room: "Science Center 204" },
    { name: "Physics I: Mechanics", room: "Physics Building 101" },
    { name: "Intro to Statistics", room: "Hamilton Hall 2B" },
    { name: "Physics I Lab", room: "Physics Lab B" },
    { name: "Technical Writing", room: "Library Seminar Room 3" },
    { name: "Intro to Film (elective)", room: "Arts Center Cinema" },
  ];
  const classes = base.map((c, i) => ({ ...c, ...n(i, fallback[i].name, fallback[i].room), id: `sample-${i + 1}`, color: i }));
  const termStart = mondayOf(today);
  return {
    v: 1,
    classes,
    selectedId: classes[0].id,
    buffer: 10,
    termStart,
    termEnd: addDays(termStart, 14 * 7 + 4),
    breakStart: addDays(termStart, 11 * 7 + 2),
    breakEnd: addDays(termStart, 11 * 7 + 4),
    useTz: true,
    commute: 40,
  };
}

function isValidState(x: unknown): x is StudioState {
  if (!x || typeof x !== "object") return false;
  const s = x as StudioState;
  return (
    s.v === 1 &&
    Array.isArray(s.classes) &&
    s.classes.every((c) => c && typeof c.id === "string" && Array.isArray(c.days) && CLASS_KINDS.includes(c.kind) && typeof c.start === "string") &&
    typeof s.termStart === "string" &&
    typeof s.buffer === "number"
  );
}

/** Studio state remembered per visitor (localStorage in try/catch; the page works without it). */
export function useStudioState(init: () => StudioState) {
  const [state, setState] = useState<StudioState>(init);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of the visitor's saved state
        if (isValidState(parsed) && parsed.classes.length > 0) setState(parsed);
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

export function toScheduleClass(c: StudioClass): ScheduleClass {
  return {
    id: c.id,
    name: c.name.trim() || c.code.trim(),
    code: c.code.trim(),
    kind: c.kind,
    days: c.days,
    startMinutes: toMinutes(c.start),
    endMinutes: toMinutes(c.end),
    location: c.room.trim(),
    instructor: c.instructor.trim(),
    credits: c.credits,
  };
}

/** Dates from breakStart to breakEnd (inclusive), capped at 60 days. */
export function breakDates(state: Pick<StudioState, "breakStart" | "breakEnd">): string[] {
  if (!state.breakStart || !state.breakEnd || state.breakEnd < state.breakStart) return [];
  const out: string[] = [];
  for (let d = state.breakStart; d <= state.breakEnd && out.length < 60; d = addDays(d, 1)) out.push(d);
  return out;
}

export function visitorTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function useDerived(state: StudioState) {
  return useMemo(() => {
    const classes = state.classes.map(toScheduleClass);
    const byId = new Map(state.classes.map((c) => [c.id, c]));
    const conflicts = findClassConflicts(classes, { bufferMinutes: state.buffer });
    const overlaps = conflicts.filter((c) => c.kind === "overlap");
    const tight = conflicts.filter((c) => c.kind === "buffer");
    const stats = weeklyScheduleStats(classes);
    const exclude = breakDates(state);
    const weeks = termWeeks(state.termStart, state.termEnd);
    const sessions = classes.map((c) => termOccurrences(c, state.termStart, state.termEnd, exclude).length);
    const termMinutes = classes.reduce((a, c, i) => a + sessions[i] * Math.max(0, c.endMinutes - c.startMinutes), 0);
    const shownDays = DAY_CODES.filter((d, i) => i < 5 || stats.days[i].classCount > 0);
    const invalid = state.classes.filter((c, i) => !(classes[i].endMinutes > classes[i].startMinutes) || c.days.length === 0);
    return { classes, byId, conflicts, overlaps, tight, stats, exclude, weeks, sessions, termMinutes, shownDays, invalid };
  }, [state]);
}

export type Derived = ReturnType<typeof useDerived>;
