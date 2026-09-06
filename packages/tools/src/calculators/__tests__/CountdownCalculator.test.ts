import { describe, expect, it } from "vitest";
import { CountdownCalculator } from "../CountdownCalculator";

const ctx = { locale: "en-US" };

describe("CountdownCalculator", () => {
  const tool = new CountdownCalculator();
  const now = new Date("2026-01-01T00:00:00Z").getTime();

  it("computes a breakdown of days, hours, minutes, and seconds", () => {
    // 1 day, 1 hour, 1 minute, 1 second ahead.
    const targetMs = now + (86400 + 3600 + 60 + 1) * 1000;
    const target = new Date(targetMs).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.isPast).toBe(false);
    expect(result.data.days).toBe(1);
    expect(result.data.hours).toBe(1);
    expect(result.data.minutes).toBe(1);
    expect(result.data.seconds).toBe(1);
  });

  it("marks a future date as not past", () => {
    const target = new Date(now + 60_000).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.isPast).toBe(false);
  });

  it("marks a past date as past", () => {
    const target = new Date(now - 60_000).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.isPast).toBe(true);
  });

  it("treats the exact target moment as past", () => {
    const target = new Date(now).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.isPast).toBe(true);
    expect(result.data.totalSeconds).toBe(0);
  });

  it("computes total seconds correctly", () => {
    const target = new Date(now + 90_000).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.totalSeconds).toBe(90);
    expect(result.data.minutes).toBe(1);
    expect(result.data.seconds).toBe(30);
  });

  it("computes a large multi-day breakdown correctly", () => {
    const target = new Date(now + 365 * 86400 * 1000).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.days).toBe(365);
    expect(result.data.hours).toBe(0);
  });

  it("rejects an invalid date string", () => {
    const result = tool.execute({ targetDateTimeISO: "not-a-date", nowMs: now }, ctx);
    expect(result.data.error).toBe("invalid-date");
  });

  it("gives a positive breakdown for elapsed time after a past event", () => {
    const target = new Date(now - (2 * 3600 + 30 * 60) * 1000).toISOString();
    const result = tool.execute({ targetDateTimeISO: target, nowMs: now }, ctx);
    expect(result.data.isPast).toBe(true);
    expect(result.data.hours).toBe(2);
    expect(result.data.minutes).toBe(30);
  });
});
