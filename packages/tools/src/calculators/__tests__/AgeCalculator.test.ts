import { describe, it, expect, vi, afterEach } from "vitest";
import { AgeCalculator } from "../AgeCalculator";
import type { ToolContext } from "@tooloralabs/core";

const context: ToolContext = { locale: "en-US" };

describe("AgeCalculator", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates age correctly when birthday already passed this year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30"));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-01-15" }, context);

    expect(result.success).toBe(true);
    expect(result.data.age).toBe(36);
  });

  it("calculates age correctly when birthday has not happened yet this year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30"));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-12-25" }, context);

    expect(result.success).toBe(true);
    expect(result.data.age).toBe(35);
  });

  it("calculates age correctly on the exact birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30"));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "2000-07-30" }, context);

    expect(result.success).toBe(true);
    expect(result.data.age).toBe(26);
  });

  it("exposes correct metadata", () => {
    const calc = new AgeCalculator();
    expect(calc.metadata.slug).toBe("age-calculator");
    expect(calc.metadata.category).toBe("calculators");
  });
});
