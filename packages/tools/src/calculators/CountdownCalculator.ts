import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type CountdownInput = {
  /** ISO 8601 date-time string for the target event, e.g. "2026-12-31T23:59:00". */
  targetDateTimeISO: string;
  /** The current time in epoch milliseconds, supplied by the caller so this stays pure. */
  nowMs: number;
};

export type CountdownError = "invalid-date";

export type CountdownOutput = {
  error: CountdownError | null;
  /** True once the target date-time has passed (including the exact moment it arrives). */
  isPast: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export class CountdownCalculator extends BaseCalculator<CountdownInput, CountdownOutput> {
  metadata = {
    id: "countdown-to-event-calculator",
    slug: "countdown-to-event-calculator",
    name: "Countdown to Event Calculator",
    category: "date-time",
    description: "A live countdown to a date and time you choose, updating automatically in days, hours, minutes, and seconds.",
    version: "1.0.0",
  };

  execute(input: CountdownInput, _context: ToolContext): ToolResult<CountdownOutput> {
    const targetMs = new Date(input.targetDateTimeISO).getTime();

    if (Number.isNaN(targetMs)) {
      return {
        success: true,
        data: { error: "invalid-date", isPast: false, totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
        metadata: {},
      };
    }

    const diffMs = targetMs - input.nowMs;
    const isPast = diffMs <= 0;
    const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);

    const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
    const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
    const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return {
      success: true,
      data: { error: null, isPast, totalSeconds, days, hours, minutes, seconds },
      metadata: {},
    };
  }
}
