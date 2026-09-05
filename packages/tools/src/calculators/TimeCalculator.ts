import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TimeOperation = "add" | "subtract";

export type TimeValue = { hours: number; minutes: number; seconds: number };

export type TimeCalculatorInput = {
  time1: TimeValue;
  time2: TimeValue;
  operation: TimeOperation;
};

export type TimeCalculatorError = "invalid-time";

export type TimeCalculatorOutput = {
  error: TimeCalculatorError | null;
  result: TimeValue;
  totalSeconds: number;
  isNegative: boolean;
};

function toSeconds(t: TimeValue): number {
  return t.hours * 3600 + t.minutes * 60 + t.seconds;
}

function isValidTimeValue(t: TimeValue): boolean {
  return (
    Number.isFinite(t.hours) &&
    t.hours >= 0 &&
    Number.isFinite(t.minutes) &&
    t.minutes >= 0 &&
    t.minutes < 60 &&
    Number.isFinite(t.seconds) &&
    t.seconds >= 0 &&
    t.seconds < 60
  );
}

function fromSeconds(totalSeconds: number): TimeValue {
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return { hours, minutes, seconds };
}

/**
 * Adds or subtracts two durations expressed as hours/minutes/seconds — distinct from clock-time
 * arithmetic (e.g. "what time is it 3 hours from now"), this operates on pure elapsed durations,
 * so subtracting a longer duration from a shorter one correctly yields a negative result rather
 * than wrapping around a 24-hour clock.
 */
export class TimeCalculator extends BaseCalculator<TimeCalculatorInput, TimeCalculatorOutput> {
  metadata = {
    id: "time-calculator",
    slug: "time-calculator",
    name: "Time Calculator",
    category: "date-time",
    description: "Add or subtract hours, minutes, and seconds between two durations.",
    version: "1.0.0",
  };

  execute(input: TimeCalculatorInput, _context: ToolContext): ToolResult<TimeCalculatorOutput> {
    const { time1, time2, operation } = input;

    if (!isValidTimeValue(time1) || !isValidTimeValue(time2)) {
      return this.error("invalid-time");
    }

    const seconds1 = toSeconds(time1);
    const seconds2 = toSeconds(time2);
    const totalSeconds = operation === "add" ? seconds1 + seconds2 : seconds1 - seconds2;

    return {
      success: true,
      data: { error: null, result: fromSeconds(totalSeconds), totalSeconds, isNegative: totalSeconds < 0 },
      metadata: {},
    };
  }

  private error(error: TimeCalculatorError): ToolResult<TimeCalculatorOutput> {
    return { success: true, data: { error, result: { hours: 0, minutes: 0, seconds: 0 }, totalSeconds: 0, isNegative: false }, metadata: {} };
  }
}
