import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  convertSaudiGpa,
  courseContributions,
  GPA_SCALES,
  gradeForLetter,
  gradeForPercent,
  honorsStanding,
  mapLetterToScale,
  planTarget,
  retakeImpact,
  summarizeCourses,
} from "../GpaPlanner";

describe("GpaPlanner - scales", () => {
  it("uses the KSU 5-point table (A+ 5.00 … F 1.00)", () => {
    const sa5 = GPA_SCALES.sa5.grades;
    expect(sa5.map((g) => g.points)).toEqual([5, 4.75, 4.5, 4, 3.5, 3, 2.5, 2, 1]);
    expect(sa5[0]).toMatchObject({ letter: "A+", minPercent: 95 });
    expect(GPA_SCALES.sa5.min).toBe(1);
  });

  it("maps percentages to grades on each scale", () => {
    expect(gradeForPercent("sa5", 96).letter).toBe("A+");
    expect(gradeForPercent("sa5", 94.9).letter).toBe("A");
    expect(gradeForPercent("sa5", 59).points).toBe(1);
    expect(gradeForPercent("sa4", 77).points).toBe(2.5);
    expect(gradeForPercent("us4", 66).letter).toBe("D");
    expect(gradeForPercent("us4", 65).letter).toBe("F");
    expect(gradeForPercent("us4", 150).letter).toBe("A");
  });

  it("falls back to the lowest grade for an unknown letter", () => {
    expect(gradeForLetter("sa5", "Z").letter).toBe("F");
  });

  it("maps letters between scales by percentage band", () => {
    expect(mapLetterToScale("sa5", "us4", "B+")).toBe("B");
    expect(mapLetterToScale("us4", "sa5", "A")).toBe("A");
  });

  it("converts GPAs exactly between the Saudi scales only", () => {
    expect(convertSaudiGpa(4.12, "sa5", "sa4")).toBe(3.12);
    expect(convertSaudiGpa(3.5, "sa4", "sa5")).toBe(4.5);
    expect(convertSaudiGpa(0.5, "sa5", "sa4")).toBe(0);
    expect(convertSaudiGpa(3.5, "us4", "sa5")).toBeNull();
    expect(convertSaudiGpa(3.5, "us4", "us4")).toBe(3.5);
  });
});

describe("GpaPlanner - semester and cumulative GPA", () => {
  it("credit-weights a term and ignores zero-credit rows", () => {
    const s = summarizeCourses([
      { credits: 3, points: 4 },
      { credits: 4, points: 3 },
      { credits: 0, points: 1 },
    ]);
    expect(s).toEqual({ credits: 7, qualityPoints: 24, gpa: 3.429 });
    expect(summarizeCourses([]).gpa).toBe(0);
  });

  it("builds a cumulative timeline on top of prior credits", () => {
    const tl = buildTimeline(4.0, 30, [
      [{ credits: 15, points: 5 }],
      [{ credits: 15, points: 3 }],
    ]);
    expect(tl[0]).toMatchObject({ gpa: 5, cumulativeCredits: 45, cumulativeQualityPoints: 195, cumulativeGpa: 4.333 });
    expect(tl[1]).toMatchObject({ cumulativeCredits: 60, cumulativeQualityPoints: 240, cumulativeGpa: 4 });
  });

  it("starts from zero without prior credits", () => {
    const tl = buildTimeline(0, 0, [[{ credits: 3, points: 4.5 }]]);
    expect(tl[0].cumulativeGpa).toBe(4.5);
  });
});

describe("GpaPlanner - target planner", () => {
  it("computes the required semester GPA", () => {
    // (4.5 × 75 − 4.2 × 60) ÷ 15 = 5.7 → impossible on 5.00
    const p = planTarget("sa5", 4.2, 60, 4.5, 15);
    expect(p.required).toBe(5.7);
    expect(p.status).toBe("impossible");
    expect(p.semestersAtMax).toBe(3);
    expect(p.bestThisSemester).toBe(4.36);
  });

  it("flags an achievable target", () => {
    const p = planTarget("us4", 3.0, 30, 3.2, 15);
    expect(p.required).toBe(3.6);
    expect(p.status).toBe("achievable");
    expect(p.semestersAtMax).toBe(1);
  });

  it("is guaranteed when even the lowest grade keeps the target", () => {
    const p = planTarget("sa5", 4.8, 100, 4.0, 15);
    expect(p.status).toBe("guaranteed");
    expect(p.semestersAtMax).toBe(0);
  });

  it("never reaches a target equal to the maximum from below", () => {
    expect(planTarget("sa4", 3.5, 30, 4, 15).semestersAtMax).toBeNull();
  });
});

describe("GpaPlanner - retake impact", () => {
  const course = { credits: 3, points: 2 };

  it("replace policy swaps the old grade", () => {
    const r = retakeImpact(120, 40, course, 4, "replace");
    expect(r).toEqual({ before: 3, after: 3.15, delta: 0.15, creditsAfter: 40 });
  });

  it("average policy counts both attempts (KSU Article 34)", () => {
    const r = retakeImpact(120, 40, course, 4, "average");
    expect(r.creditsAfter).toBe(43);
    expect(r.after).toBe(3.07);
    expect(r.delta).toBe(0.07);
  });
});

describe("GpaPlanner - honors", () => {
  it("returns the highest honor met and the gaps", () => {
    const h = honorsStanding("sa5", 4.5);
    expect(h.current).toBe("second");
    expect(h.gaps).toEqual([
      { key: "first", min: 4.75, gap: 0.25, met: false },
      { key: "second", min: 4.25, gap: 0, met: true },
    ]);
  });

  it("uses Latin honors on the US scale", () => {
    expect(honorsStanding("us4", 3.92).current).toBe("summa");
    expect(honorsStanding("us4", 3.8).current).toBe("magna");
    expect(honorsStanding("us4", 3.49).current).toBeNull();
    expect(honorsStanding("sa4", 3.75).current).toBe("first");
  });
});

describe("GpaPlanner - course contributions", () => {
  it("pulls sum to zero and shares sum to one", () => {
    const c = courseContributions([
      { credits: 3, points: 4 },
      { credits: 4, points: 3 },
      { credits: 3, points: 2 },
    ]);
    expect(c.reduce((s, x) => s + x.pull, 0)).toBeCloseTo(0, 3);
    expect(c.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1, 3);
    expect(c[0].qualityPoints).toBe(12);
  });
});
