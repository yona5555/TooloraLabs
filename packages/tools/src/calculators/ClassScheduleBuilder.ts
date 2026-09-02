import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DayCode = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_CODES: DayCode[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export type ClassEntryInput = {
  name: string;
  days: DayCode[];
  startMinutes: number;
  endMinutes: number;
};

export type ClassScheduleBuilderInput = {
  classes: ClassEntryInput[];
};

export type ClassScheduleBuilderError = "empty-schedule" | "invalid-class-time" | "missing-days";

export type ScheduleConflict = {
  classNameA: string;
  classNameB: string;
  day: DayCode;
  overlapStartMinutes: number;
  overlapEndMinutes: number;
};

export type ClassScheduleBuilderOutput = {
  error: ClassScheduleBuilderError | null;
  errorDetail: string | null;
  conflicts: ScheduleConflict[];
  totalWeeklyMinutes: number;
  hasConflicts: boolean;
};

/**
 * Detects day/time overlaps across a list of weekly class meeting times and
 * totals scheduled hours. Two classes conflict only on days they both meet,
 * and only if their [start, end) time intervals actually overlap on that
 * day — meeting back-to-back (one ends exactly when the other starts) does
 * not count as a conflict.
 */
export class ClassScheduleBuilder extends BaseCalculator<ClassScheduleBuilderInput, ClassScheduleBuilderOutput> {
  metadata = {
    id: "class-schedule-builder",
    slug: "class-schedule-builder",
    name: "Class Schedule Builder",
    category: "calculators",
    description: "Build a weekly class schedule and automatically detect any day/time conflicts between classes.",
    version: "1.0.0",
  };

  execute(input: ClassScheduleBuilderInput, _context: ToolContext): ToolResult<ClassScheduleBuilderOutput> {
    const { classes } = input;

    if (classes.length === 0) {
      return this.errorResult("empty-schedule", "Add at least one class to build a schedule.");
    }

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      if (!(cls.endMinutes > cls.startMinutes)) {
        return this.errorResult("invalid-class-time", `"${cls.name || `Class ${i + 1}`}" needs an end time after its start time.`);
      }
      if (cls.days.length === 0) {
        return this.errorResult("missing-days", `"${cls.name || `Class ${i + 1}`}" needs at least one meeting day.`);
      }
    }

    const conflicts: ScheduleConflict[] = [];
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const a = classes[i];
        const b = classes[j];
        const sharedDays = a.days.filter((day) => b.days.includes(day));
        for (const day of sharedDays) {
          const overlapStart = Math.max(a.startMinutes, b.startMinutes);
          const overlapEnd = Math.min(a.endMinutes, b.endMinutes);
          if (overlapStart < overlapEnd) {
            conflicts.push({
              classNameA: a.name,
              classNameB: b.name,
              day,
              overlapStartMinutes: overlapStart,
              overlapEndMinutes: overlapEnd,
            });
          }
        }
      }
    }

    const totalWeeklyMinutes = classes.reduce((sum, cls) => sum + (cls.endMinutes - cls.startMinutes) * cls.days.length, 0);

    return {
      success: true,
      data: { error: null, errorDetail: null, conflicts, totalWeeklyMinutes, hasConflicts: conflicts.length > 0 },
      metadata: {},
    };
  }

  private errorResult(error: ClassScheduleBuilderError, detail: string): ToolResult<ClassScheduleBuilderOutput> {
    return {
      success: true,
      data: { error, errorDetail: detail, conflicts: [], totalWeeklyMinutes: 0, hasConflicts: false },
      metadata: {},
    };
  }
}
