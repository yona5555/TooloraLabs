import { describe, it, expect } from "vitest";
import { ClassScheduleBuilder } from "../ClassScheduleBuilder";

const context = { locale: "en-US" };
const calc = new ClassScheduleBuilder();

describe("ClassScheduleBuilder", () => {
  it("finds no conflicts for classes on different days", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 },
          { name: "Chem", days: ["tue"], startMinutes: 540, endMinutes: 600 },
        ],
      },
      context
    );
    expect(r.data.error).toBeNull();
    expect(r.data.hasConflicts).toBe(false);
    expect(r.data.conflicts).toHaveLength(0);
  });

  it("detects an overlap between two classes sharing a day", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 }, // 9:00-10:30
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 }, // 10:00-11:00
        ],
      },
      context
    );
    expect(r.data.hasConflicts).toBe(true);
    expect(r.data.conflicts).toHaveLength(1);
    expect(r.data.conflicts[0]).toMatchObject({
      classNameA: "Math",
      classNameB: "Physics",
      day: "mon",
      overlapStartMinutes: 600,
      overlapEndMinutes: 630,
    });
  });

  it("does not flag back-to-back classes (one ends exactly when the other starts)", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon"], startMinutes: 540, endMinutes: 600 },
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 },
        ],
      },
      context
    );
    expect(r.data.hasConflicts).toBe(false);
  });

  it("only flags a conflict on the specific day(s) both classes share", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 },
          { name: "Physics", days: ["wed", "fri"], startMinutes: 600, endMinutes: 660 },
        ],
      },
      context
    );
    expect(r.data.conflicts).toHaveLength(1);
    expect(r.data.conflicts[0].day).toBe("wed");
  });

  it("computes total weekly scheduled minutes across all classes and days", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 }, // 90 min x 2
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 }, // 60 min x 1
          { name: "Chem", days: ["tue"], startMinutes: 540, endMinutes: 600 }, // 60 min x 1
        ],
      },
      context
    );
    expect(r.data.totalWeeklyMinutes).toBe(180 + 60 + 60);
  });

  it("detects multiple simultaneous conflicts across three classes", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "A", days: ["mon"], startMinutes: 540, endMinutes: 660 },
          { name: "B", days: ["mon"], startMinutes: 600, endMinutes: 630 },
          { name: "C", days: ["mon"], startMinutes: 615, endMinutes: 700 },
        ],
      },
      context
    );
    // A-B overlap, A-C overlap, B-C overlap => 3 pairwise conflicts
    expect(r.data.conflicts).toHaveLength(3);
  });

  it("flags an empty class list", () => {
    const r = calc.execute({ classes: [] }, context);
    expect(r.data.error).toBe("empty-schedule");
  });

  it("flags a class with end time not after start time", () => {
    const r = calc.execute({ classes: [{ name: "Math", days: ["mon"], startMinutes: 600, endMinutes: 600 }] }, context);
    expect(r.data.error).toBe("invalid-class-time");
  });

  it("flags a class with no meeting days", () => {
    const r = calc.execute({ classes: [{ name: "Math", days: [], startMinutes: 540, endMinutes: 600 }] }, context);
    expect(r.data.error).toBe("missing-days");
  });
});
