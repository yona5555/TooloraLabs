/**
 * All conversion here relies only on `Intl.DateTimeFormat`, a JavaScript
 * built-in backed by the IANA time zone database — no external API, no
 * network call, no rate limit, and correct for any date (including past/
 * future DST transitions) since the runtime's own tz data drives it.
 */

/** Returns the UTC offset, in minutes, of `ianaZone` at the instant `date` (positive = ahead of UTC). */
export function getTimeZoneOffsetMinutes(date: Date, ianaZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/**
 * Converts a wall-clock time — as it would read on a clock in `ianaZone` —
 * into the absolute UTC instant it represents. Iterates twice: the offset
 * used to correct the initial guess can itself change if the guess lands on
 * the wrong side of a DST transition, so a second pass re-reads the offset
 * at the corrected instant to converge.
 */
export function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  ianaZone: string
): Date {
  const wallAsUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  let guessMs = wallAsUtcMs;

  for (let i = 0; i < 2; i++) {
    const offsetMinutes = getTimeZoneOffsetMinutes(new Date(guessMs), ianaZone);
    guessMs = wallAsUtcMs - offsetMinutes * 60_000;
  }

  return new Date(guessMs);
}

/** The zone's calendar date at `date`, as a single comparable integer (days since epoch). */
export function getZonedDayNumber(date: Date, ianaZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000;
}

/** How many calendar days ahead (positive) or behind (negative) `toZone`'s date is versus `fromZone`'s, at the same instant. */
export function getDayDifference(date: Date, fromZone: string, toZone: string): number {
  return getZonedDayNumber(date, toZone) - getZonedDayNumber(date, fromZone);
}

export type TimeConversionResult = {
  utcInstant: number;
  fromOffsetMinutes: number;
  toOffsetMinutes: number;
  /** to − from, in minutes. Positive means `toZone` is ahead of `fromZone`. */
  differenceMinutes: number;
  dayDifference: number;
};

export function convertBetweenZones(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  fromZone: string,
  toZone: string
): TimeConversionResult {
  const utcDate = zonedWallTimeToUtc(year, month, day, hour, minute, fromZone);
  return compareZonesAtInstant(utcDate, fromZone, toZone);
}

/**
 * For when the instant is already known absolutely (typically `new Date()`,
 * "right now") rather than entered as a wall-clock reading that needs
 * interpreting against a specific zone. Using `convertBetweenZones` with
 * that instant's local getters (`.getHours()` etc.) instead of this function
 * would silently misinterpret the *caller's own system time zone* as
 * `fromZone`'s wall clock — wrong everywhere the two don't happen to match.
 */
export function compareZonesAtInstant(instant: Date, fromZone: string, toZone: string): TimeConversionResult {
  const fromOffsetMinutes = getTimeZoneOffsetMinutes(instant, fromZone);
  const toOffsetMinutes = getTimeZoneOffsetMinutes(instant, toZone);

  return {
    utcInstant: instant.getTime(),
    fromOffsetMinutes,
    toOffsetMinutes,
    differenceMinutes: toOffsetMinutes - fromOffsetMinutes,
    dayDifference: getDayDifference(instant, fromZone, toZone),
  };
}

/** "+05:30" / "-08:00" / "+00:00" style, always signed and zero-padded. */
export function formatUtcOffsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export type TimeDifference = { hours: number; minutes: number; isAhead: boolean; isSame: boolean };

export function describeDifference(differenceMinutes: number): TimeDifference {
  const abs = Math.abs(differenceMinutes);
  return {
    hours: Math.floor(abs / 60),
    minutes: abs % 60,
    isAhead: differenceMinutes > 0,
    isSame: differenceMinutes === 0,
  };
}

/**
 * The UTC hours (0-23) during which the local time in *both* zones falls
 * within `[startHour, endHour)` on `referenceDate` — the overlap a visitor
 * would actually want when scheduling a call. Uses each zone's offset at
 * noon UTC on the reference date as a stand-in for the whole day: offsets
 * essentially never change mid-day (DST transitions happen at 1-3 a.m.
 * local time), so this is accurate for all but a couple of hours, once a
 * year, in zones that observe DST.
 */
export function findOverlappingBusinessHours(
  fromZone: string,
  toZone: string,
  referenceDate: Date,
  startHour = 9,
  endHour = 17
): number[] {
  const noonUtc = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate(), 12));
  const fromOffset = getTimeZoneOffsetMinutes(noonUtc, fromZone);
  const toOffset = getTimeZoneOffsetMinutes(noonUtc, toZone);

  const overlapping: number[] = [];
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const fromLocalHour = (((utcHour + fromOffset / 60) % 24) + 24) % 24;
    const toLocalHour = (((utcHour + toOffset / 60) % 24) + 24) % 24;
    if (fromLocalHour >= startHour && fromLocalHour < endHour && toLocalHour >= startHour && toLocalHour < endHour) {
      overlapping.push(utcHour);
    }
  }
  return overlapping;
}
