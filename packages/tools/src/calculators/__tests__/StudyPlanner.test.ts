import { describe, it, expect } from "vitest";
import {
  addDaysIso,
  daysBetweenIso,
  planStudy,
  pomodoroForFocus,
  pomodoroInWindow,
  retentionCurve,
  studyUrgency,
  weekdayMondayFirst,
  type StudyExamInput,
} from "../StudyTimeCalculator";

const START = "2026-10-19"; // a Monday
const exam = (id: string, inDays: number, targetHours: number, extra: Partial<StudyExamInput> = {}): StudyExamInput => ({
  id,
  date: addDaysIso(START, inDays),
  difficulty: 3,
  credits: 3,
  topics: 6,
  targetHours,
  ...extra,
});
const sumPlanned = (r: ReturnType<typeof planStudy>, id: string) =>
  r.days.reduce((a, d) => a + d.sessions.filter((s) => s.examId === id).reduce((b, s) => b + s.minutes, 0), 0);

describe("Pomodoro math", () => {
  it("lays out 2 hours of focus as 5 pomodoros with the last one partial", () => {
    const p = pomodoroForFocus(120);
    expect(p.pomodoros).toBe(5);
    expect(p.fullPomodoros).toBe(4);
    expect(p.lastPomodoroMinutes).toBe(20);
    // breaks after pomodoros 1,2,3 (short) and 4 (long), none after the last
    expect(p.shortBreaks).toBe(3);
    expect(p.longBreaks).toBe(1);
    expect(p.breakMinutes).toBe(30);
    expect(p.wallMinutes).toBe(150);
    expect(p.focusRatio).toBeCloseTo(0.8, 10);
    expect(p.cycles).toBe(1);
  });

  it("places blocks back to back from minute 0", () => {
    const p = pomodoroForFocus(50, { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakEvery: 4 });
    expect(p.blocks.map((b) => [b.kind, b.start, b.minutes])).toEqual([
      ["work", 0, 25],
      ["short", 25, 5],
      ["work", 30, 25],
    ]);
  });

  it("returns an empty session for zero focus", () => {
    const p = pomodoroForFocus(0);
    expect(p.pomodoros).toBe(0);
    expect(p.wallMinutes).toBe(0);
    expect(p.focusRatio).toBe(0);
  });

  it("sanitizes invalid settings (work ≥ 1, breaks ≥ 0, cycle ≥ 1)", () => {
    const p = pomodoroForFocus(60, { workMinutes: 0, shortBreakMinutes: -3, longBreakMinutes: 10, longBreakEvery: 0 });
    // work clamps to 1 minute, cycle to 1 → every break is a long break
    expect(p.pomodoros).toBe(60);
    expect(p.shortBreaks).toBe(0);
    expect(p.longBreaks).toBe(59);
  });

  it("fits whole pomodoros into a wall-clock window", () => {
    // 4 × 25 + 3 × 5 = 115; a 5th needs a 15-minute long break first → 155 > 130
    const w = pomodoroInWindow(130);
    expect(w.pomodoros).toBe(4);
    expect(w.focusMinutes).toBe(100);
    expect(w.breakMinutes).toBe(15);
    expect(w.leftoverMinutes).toBe(15);
    expect(pomodoroInWindow(20).pomodoros).toBe(0);
    expect(pomodoroInWindow(20).leftoverMinutes).toBe(20);
  });

  it("raises the focus ratio with longer work blocks", () => {
    const short = pomodoroForFocus(240, { workMinutes: 25 }).focusRatio;
    const long = pomodoroForFocus(240, { workMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30, longBreakEvery: 4 }).focusRatio;
    expect(long).toBeGreaterThan(short);
  });
});

describe("date helpers", () => {
  it("counts calendar days and weekdays in UTC", () => {
    expect(daysBetweenIso("2026-10-19", "2026-11-02")).toBe(14);
    expect(addDaysIso("2026-12-31", 1)).toBe("2027-01-01");
    expect(weekdayMondayFirst("2026-10-19")).toBe(0);
    expect(weekdayMondayFirst("2026-10-25")).toBe(6);
    expect(daysBetweenIso("2026-02-30", "2026-03-01")).toBeNull();
  });
});

describe("exam planner", () => {
  const weekly = [3, 3, 3, 3, 3, 4, 4];

  it("meets every target when capacity allows and never studies on or after an exam date", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [exam("a", 5, 6), exam("b", 9, 8), exam("c", 14, 10)] });
    expect(r.totals.feasible).toBe(true);
    expect(r.totals.shortfallMinutes).toBe(0);
    for (const e of r.exams) {
      expect(e.plannedMinutes).toBe(e.targetMinutes);
      expect(sumPlanned(r, e.id)).toBe(e.plannedMinutes);
      for (const d of r.days) if (d.index >= e.examIndex) expect(d.sessions.some((s) => s.examId === e.id)).toBe(false);
    }
    expect(r.days).toHaveLength(15);
    expect(r.totals.freeMinutes).toBe(r.totals.capacityMinutes - r.totals.plannedMinutes);
  });

  it("respects the daily capacity and works in 15-minute blocks", () => {
    const r = planStudy({ startDate: START, weeklyHours: [1.6, 2, 2, 2, 2, 0, 0], exams: [exam("a", 6, 30), exam("b", 8, 30)] });
    for (const d of r.days) {
      expect(d.usedMinutes).toBeLessThanOrEqual(d.capacityMinutes);
      for (const s of d.sessions) expect(s.minutes % 15).toBe(0);
    }
    // 1.6 h floors to 90 minutes of 15-minute blocks
    expect(r.days[0].capacityMinutes).toBe(90);
    expect(r.days[5].usedMinutes).toBe(0);
  });

  it("books spaced reviews 7, 3 and 1 day before the exam", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [exam("a", 10, 10)] });
    const a = r.exams[0];
    expect(a.reviewDays).toEqual([3, 7, 9]);
    expect(a.reviewEachMinutes).toBe(60);
    expect(a.reviewMinutes).toBe(180);
    expect(a.learnMinutes).toBe(420);
    for (const d of a.reviewDays) expect(r.days[d].sessions.find((s) => s.examId === "a" && s.kind === "review")?.minutes).toBe(60);
  });

  it("only books the reviews that fit before a near exam", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [exam("a", 2, 4)] });
    expect(r.exams[0].reviewDays).toEqual([1]);
  });

  it("ranks priority by difficulty × credits × urgency", () => {
    const r = planStudy({
      startDate: START,
      weeklyHours: weekly,
      exams: [exam("near", 2, 4, { difficulty: 2, credits: 2 }), exam("far", 20, 4, { difficulty: 5, credits: 4 })],
    });
    const [near, far] = r.exams;
    expect(near.weight).toBe(4);
    expect(near.urgency).toBeCloseTo(studyUrgency(2), 10);
    expect(near.priority).toBeCloseTo(4 * 4.5, 10);
    expect(far.priority).toBeCloseTo(20 * 1.35, 10);
  });

  it("gives the earlier exam what it needs when time is tight (earliest deadline guard)", () => {
    // 2 h per day; exam a in 3 days needs 6 h = all capacity before it.
    const r = planStudy({ startDate: START, weeklyHours: [2, 2, 2, 2, 2, 2, 2], exams: [exam("a", 3, 6, { difficulty: 1, credits: 1 }), exam("b", 10, 6, { difficulty: 5, credits: 10 })] });
    expect(r.exams[0].shortfallMinutes).toBe(0);
    expect(r.exams[1].shortfallMinutes).toBe(0);
  });

  it("reports the shortfall when overloaded", () => {
    const r = planStudy({ startDate: START, weeklyHours: [1, 1, 1, 1, 1, 1, 1], exams: [exam("a", 4, 10), exam("b", 6, 10)] });
    expect(r.totals.feasible).toBe(false);
    expect(r.totals.capacityMinutes).toBe(6 * 60);
    expect(r.totals.plannedMinutes).toBe(6 * 60);
    expect(r.totals.freeMinutes).toBe(0);
    expect(r.totals.shortfallMinutes).toBe(20 * 60 - 6 * 60);
    expect(r.totals.loadRatio).toBeCloseTo(20 / 6, 10);
  });

  it("handles zero availability: everything is shortfall", () => {
    const r = planStudy({ startDate: START, weeklyHours: [0, 0, 0, 0, 0, 0, 0], exams: [exam("a", 5, 6)] });
    expect(r.totals.capacityMinutes).toBe(0);
    expect(r.totals.plannedMinutes).toBe(0);
    expect(r.exams[0].shortfallMinutes).toBe(360);
    expect(r.totals.loadRatio).toBe(Infinity);
    expect(r.totals.peakDay).toBe(-1);
  });

  it("handles an exam today: no study possible, full shortfall, day still listed", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [exam("t", 0, 3)] });
    expect(r.exams[0].status).toBe("today");
    expect(r.exams[0].plannedMinutes).toBe(0);
    expect(r.exams[0].shortfallMinutes).toBe(180);
    expect(r.days).toHaveLength(1);
    expect(r.days[0].examIds).toEqual(["t"]);
    expect(r.days[0].usableMinutes).toBe(0);
  });

  it("ignores past exams and invalid dates", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [exam("p", -2, 5), { ...exam("x", 3, 5), date: "soon" }, exam("a", 3, 2)] });
    expect(r.exams.map((e) => e.status)).toEqual(["past", "invalid", "upcoming"]);
    expect(r.totals.requiredMinutes).toBe(120);
    expect(r.days).toHaveLength(4);
  });

  it("returns an empty plan with no exams", () => {
    const r = planStudy({ startDate: START, weeklyHours: weekly, exams: [] });
    expect(r.days).toHaveLength(0);
    expect(r.totals.feasible).toBe(true);
    expect(r.totals.loadRatio).toBe(0);
  });

  it("is deterministic", () => {
    const input = { startDate: START, weeklyHours: weekly, exams: [exam("a", 5, 7), exam("b", 9, 9), exam("c", 13, 11)] };
    expect(planStudy(input)).toEqual(planStudy(input));
  });

  it("counts covered topics from the learning time", () => {
    const r = planStudy({ startDate: START, weeklyHours: [1, 1, 1, 1, 1, 1, 1], exams: [exam("a", 4, 10, { topics: 8 })] });
    const a = r.exams[0];
    expect(a.topicsCovered).toBeLessThan(8);
    expect(a.topicsCovered).toBe(Math.floor((a.learnMinutes / a.learnTargetMinutes) * 8));
  });
});

describe("retention curve", () => {
  it("decays exponentially without reviews", () => {
    const c = retentionCurve({ learnDay: 0, reviewDays: [], endDay: 3, baseStability: 1.5 });
    expect(c.atEnd).toBeCloseTo(Math.exp(-2), 10);
    expect(c.points[0].r).toBe(1);
  });

  it("each review resets recall and grows stability", () => {
    const c = retentionCurve({ learnDay: 0, reviewDays: [3, 7, 9], endDay: 10, baseStability: 1.5, growth: 2.5 });
    expect(c.stabilityAtEnd).toBeCloseTo(1.5 * 2.5 ** 3, 10);
    expect(c.atEnd).toBeCloseTo(Math.exp(-1 / (1.5 * 2.5 ** 3)), 10);
    expect(c.atEnd).toBeGreaterThan(retentionCurve({ learnDay: 0, reviewDays: [], endDay: 10 }).atEnd);
  });
});
