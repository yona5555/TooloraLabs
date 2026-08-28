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
