import { describe, it, expect } from "vitest";
import { StudyTimeCalculator } from "../StudyTimeCalculator";

const context = { locale: "en-US" };
const calc = new StudyTimeCalculator();

const DEFAULTS = { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, pomodorosBeforeLongBreak: 4 };

describe("StudyTimeCalculator", () => {
  it("fits a single pomodoro with no break when time only covers the work block", () => {
    const r = calc.execute({ totalMinutes: 25, ...DEFAULTS }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.completedPomodoros).toBe(1);
    expect(r.data.shortBreaksTaken).toBe(0);
    expect(r.data.totalWorkMinutes).toBe(25);
    expect(r.data.totalBreakMinutes).toBe(0);
    expect(r.data.leftoverMinutes).toBe(0);
  });

  it("schedules a short break after a pomodoro when time allows", () => {
    const r = calc.execute({ totalMinutes: 30, ...DEFAULTS }, context);
    expect(r.data.completedPomodoros).toBe(1);
    expect(r.data.shortBreaksTaken).toBe(1);
    expect(r.data.totalBreakMinutes).toBe(5);
    expect(r.data.leftoverMinutes).toBe(0);
  });

  it("schedules a long break after the configured number of pomodoros", () => {
    // 4 pomodoros (25) + 3 short breaks (5) + 1 long break (15) = 100 + 15 + 15 = 130
    const r = calc.execute({ totalMinutes: 130, ...DEFAULTS }, context);
    expect(r.data.completedPomodoros).toBe(4);
    expect(r.data.shortBreaksTaken).toBe(3);
    expect(r.data.longBreaksTaken).toBe(1);
    expect(r.data.totalWorkMinutes).toBe(100);
    expect(r.data.totalBreakMinutes).toBe(30);
    expect(r.data.leftoverMinutes).toBe(0);
  });

  it("keeps a completed pomodoro even when there isn't enough time left for its break", () => {
    const r = calc.execute({ totalMinutes: 27, ...DEFAULTS }, context);
    expect(r.data.completedPomodoros).toBe(1);
    expect(r.data.shortBreaksTaken).toBe(0);
    expect(r.data.totalBreakMinutes).toBe(0);
    expect(r.data.leftoverMinutes).toBe(2);
  });

  it("reports leftover minutes that don't cover another full pomodoro", () => {
    const r = calc.execute({ totalMinutes: 40, ...DEFAULTS }, context);
    // 1 pomodoro (25) + short break (5) = 30, leaving 10 (not enough for another 25-minute block)
    expect(r.data.completedPomodoros).toBe(1);
    expect(r.data.shortBreaksTaken).toBe(1);
    expect(r.data.leftoverMinutes).toBe(10);
  });

  it("skips scheduling any break when break length is configured as zero", () => {
    const r = calc.execute({ totalMinutes: 50, workMinutes: 25, shortBreakMinutes: 0, longBreakMinutes: 0, pomodorosBeforeLongBreak: 4 }, context);
    expect(r.data.completedPomodoros).toBe(2);
    expect(r.data.totalBreakMinutes).toBe(0);
    expect(r.data.leftoverMinutes).toBe(0);
  });

  it("rounds a fractional pomodoros-before-long-break setting", () => {
    const r = calc.execute({ totalMinutes: 130, workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, pomodorosBeforeLongBreak: 4.4 }, context);
    expect(r.data.longBreaksTaken).toBe(1);
  });

  it("flags a session shorter than a single work block", () => {
    const r = calc.execute({ totalMinutes: 10, ...DEFAULTS }, context);
    expect(r.data.error).toBe("session-too-short");
    expect(r.data.completedPomodoros).toBe(0);
  });

  it("flags a non-positive total duration", () => {
    expect(calc.execute({ totalMinutes: 0, ...DEFAULTS }, context).data.error).toBe("invalid-total-minutes");
    expect(calc.execute({ totalMinutes: -5, ...DEFAULTS }, context).data.error).toBe("invalid-total-minutes");
  });

  it("flags a non-positive work interval", () => {
    const r = calc.execute({ totalMinutes: 60, ...DEFAULTS, workMinutes: 0 }, context);
    expect(r.data.error).toBe("invalid-work-minutes");
  });

  it("flags a negative break length", () => {
    const r = calc.execute({ totalMinutes: 60, ...DEFAULTS, shortBreakMinutes: -1 }, context);
    expect(r.data.error).toBe("invalid-break-minutes");
  });

  it("flags an invalid pomodoros-before-long-break cycle length", () => {
    const r = calc.execute({ totalMinutes: 60, ...DEFAULTS, pomodorosBeforeLongBreak: 0 }, context);
    expect(r.data.error).toBe("invalid-cycle-length");
  });
});
