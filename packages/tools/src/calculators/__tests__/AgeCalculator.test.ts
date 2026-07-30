import { describe, it, expect, vi, afterEach } from "vitest";
import { AgeCalculator } from "../AgeCalculator";
import type { ToolContext } from "@tooloralabs/core";

const context: ToolContext = { locale: "en-US" };

describe("AgeCalculator", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns full breakdown for a past birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30"));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-01-15" }, context);

    expect(result.success).toBe(true);
    expect(result.data.years).toBe(36);
    expect(result.data.nextBirthday).toBe("January 15, 2027");
  });

  it("exposes correct metadata", () => {
    const calc = new AgeCalculator();
    expect(calc.metadata.slug).toBe("age-calculator");
  });
});
