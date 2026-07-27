import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
  format,
  intervalToDuration,
} from "date-fns";

import { AgeResult } from "./types";

export function calculateAge(
  birthDate: Date,
  currentDate: Date = new Date()
): AgeResult {
  const duration = intervalToDuration({
    start: birthDate,
    end: currentDate,
  });

  const nextBirthday = new Date(
    currentDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  if (nextBirthday < currentDate) {
    nextBirthday.setFullYear(currentDate.getFullYear() + 1);
  }

  return {
    years: duration.years ?? 0,
    months: duration.months ?? 0,
    days: duration.days ?? 0,

    totalDays: differenceInCalendarDays(currentDate, birthDate),
    totalWeeks: differenceInWeeks(currentDate, birthDate),
    totalHours: differenceInHours(currentDate, birthDate),
    totalMinutes: differenceInMinutes(currentDate, birthDate),
    totalSeconds: differenceInSeconds(currentDate, birthDate),

    nextBirthday: format(nextBirthday, "MMMM d, yyyy"),
    daysUntilBirthday: differenceInCalendarDays(
      nextBirthday,
      currentDate
    ),
  };
}
