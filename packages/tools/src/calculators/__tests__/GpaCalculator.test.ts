import { describe, it, expect } from "vitest";
import { GpaCalculator } from "../GpaCalculator";

const context = { locale: "en-US" };
const calc = new GpaCalculator();

const baseInput = {
  operation: "calculate" as const,
  courses: [] as { gradePoints: number; creditHours: number }[],
  currentGpa: 0,
  currentCredits: 0,
  targetGpa: 0,
  plannedCredits: 0,
};

describe("GpaCalculator - calculate mode", () => {
  it("computes a credit-weighted GPA across multiple courses", () => {
    const r = calc.execute(
      {
        ...baseInput,
        courses: [
          { gradePoints: 4.0, creditHours: 3 },
          { gradePoints: 3.0, creditHours: 4 },
          { gradePoints: 3.7, creditHours: 3 },
        ],
      },
      context
    );
    // (4*3 + 3*4 + 3.7*3) / 10 = (12 + 12 + 11.1) / 10 = 3.51
    expect(r.data.gpa).toBe(3.51);
    expect(r.data.totalCredits).toBe(10);
  });

  it("ignores courses with zero credit hours", () => {
    const r = calc.execute(
      {
        ...baseInput,
        courses: [
          { gradePoints: 4.0, creditHours: 3 },
          { gradePoints: 0, creditHours: 0 },
        ],
      },
      context
    );
    expect(r.data.gpa).toBe(4.0);
    expect(r.data.totalCredits).toBe(3);
  });

  it("flags an error when there are no valid courses", () => {
    const r = calc.execute({ ...baseInput, courses: [] }, context);
    expect(r.data.error).toBe("no-courses");
  });
});

describe("GpaCalculator - target mode", () => {
  it("computes the GPA needed on upcoming credits to reach a target", () => {
    const r = calc.execute(
      {
        ...baseInput,
        operation: "target",
        currentGpa: 3.0,
        currentCredits: 60,
        targetGpa: 3.5,
        plannedCredits: 30,
      },
      context
    );
    // current quality points = 180, needed total = 3.5*90 = 315, needed from planned = 135, / 30 = 4.5
    expect(r.data.requiredGpa).toBe(4.5);
    expect(r.data.isAchievable).toBe(false);
  });

  it("flags an achievable target within the 4.0 scale", () => {
    const r = calc.execute(
      {
        ...baseInput,
        operation: "target",
        currentGpa: 3.0,
        currentCredits: 90,
        targetGpa: 3.1,
        plannedCredits: 30,
      },
      context
    );
    // current quality points = 270, needed total = 3.1*120 = 372, needed from planned = 102, / 30 = 3.4
    expect(r.data.requiredGpa).toBe(3.4);
    expect(r.data.isAchievable).toBe(true);
  });

  it("flags invalid planned credits", () => {
    const r = calc.execute(
      { ...baseInput, operation: "target", currentGpa: 3.0, currentCredits: 60, targetGpa: 3.5, plannedCredits: 0 },
      context
    );
    expect(r.data.error).toBe("invalid-planned-credits");
  });
});
