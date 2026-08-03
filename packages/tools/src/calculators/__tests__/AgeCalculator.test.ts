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
    vi.setSystemTime(new Date(2026, 6, 30));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-01-15" }, context);

    expect(result.success).toBe(true);
    expect(result.data.years).toBe(36);
    expect(result.data.nextBirthdayISO).toBe("2027-01-15");
  });

  it("exposes correct metadata", () => {
    const calc = new AgeCalculator();
    expect(calc.metadata.slug).toBe("age-calculator");
  });

  it("computes zero days until birthday and 0% year progress on the exact birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));

    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-06-15" }, context);

    expect(result.data.daysUntilBirthday).toBe(0);
    expect(result.data.yearProgressPercent).toBe(0);
  });

  it("respects a custom reference date instead of the system clock", () => {
    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "2000-01-01", referenceDate: "2030-01-01" }, context);

    expect(result.data.years).toBe(30);
    expect(result.data.referenceDateISO).toBe("2030-01-01");
  });

  it("parses birth dates as local calendar days, not UTC midnight", () => {
    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-01-15", referenceDate: "1990-01-15" }, context);

    expect(result.data.birthDateISO).toBe("1990-01-15");
    expect(result.data.totalDays).toBe(0);
  });

  it("includes a Hijri age breakdown", () => {
    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "1990-01-15", referenceDate: "2026-08-03" }, context);

    expect(result.data.hijri.birth).toEqual({ year: 1410, month: 6, day: 17 });
    expect(result.data.hijri.now).toEqual({ year: 1448, month: 2, day: 18 });
    expect(result.data.hijri.years).toBeGreaterThan(result.data.years);
  });

  it("lists milestone ages with correct past/future status", () => {
    const calc = new AgeCalculator();
    const result = calc.execute({ birthDate: "2000-01-01", referenceDate: "2026-08-03" }, context);

    const eighteen = result.data.milestones.find((m) => m.ageYears === 18);
    const sixtyFive = result.data.milestones.find((m) => m.ageYears === 65);

    expect(eighteen?.isPast).toBe(true);
    expect(sixtyFive?.isPast).toBe(false);
  });
});
