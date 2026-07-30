import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
  format,
  intervalToDuration,
} from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: string;
  daysUntilBirthday: number;
};

export type AgeInput = { birthDate: string };

export class AgeCalculator extends BaseCalculator<AgeInput, AgeResult> {
  metadata = {
    id: "age-calculator",
    slug: "age-calculator",
    name: "Age Calculator",
    category: "calculators",
    description: "Calculate age from birth date.",
    version: "1.0.0",
  };

  execute(
    input: AgeInput,
    _context: ToolContext
  ): ToolResult<AgeResult> {
    const birthDate = new Date(input.birthDate);
    const currentDate = new Date();

    const duration = intervalToDuration({ start: birthDate, end: currentDate });

    const nextBirthday = new Date(
      currentDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (nextBirthday < currentDate) {
      nextBirthday.setFullYear(currentDate.getFullYear() + 1);
    }

    return {
      success: true,
      data: {
        years: duration.years ?? 0,
        months: duration.months ?? 0,
        days: duration.days ?? 0,
        totalDays: differenceInCalendarDays(currentDate, birthDate),
        totalWeeks: differenceInWeeks(currentDate, birthDate),
        totalHours: differenceInHours(currentDate, birthDate),
        totalMinutes: differenceInMinutes(currentDate, birthDate),
        totalSeconds: differenceInSeconds(currentDate, birthDate),
        nextBirthday: format(nextBirthday, "MMMM d, yyyy"),
        daysUntilBirthday: differenceInCalendarDays(nextBirthday, currentDate),
      },
      metadata: {},
    };
  }
}
