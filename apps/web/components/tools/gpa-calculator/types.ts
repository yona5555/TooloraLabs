export type { GpaOperation, GpaCalculatorOutput as GpaResult } from "@tooloralabs/tools";

export type LetterGrade = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export const GRADE_POINTS: Record<LetterGrade, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

export const LETTER_GRADES: LetterGrade[] = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export type DraftCourse = {
  grade: LetterGrade;
  creditHours: string;
};

export function emptyCourse(): DraftCourse {
  return { grade: "A", creditHours: "3" };
}

export const GPA_GAUGE_MAX = 4.0;
export const GPA_GAUGE_TICKS = [0, 1.0, 2.0, 3.0, 3.5, 4.0];

export type GpaBand = "probation" | "satisfactory" | "good" | "excellent";

/** Standard, widely-used US undergraduate GPA standing bands (probation below 2.0, good standing from 3.0, Dean's-List-range from 3.5). */
export function bandForGpa(gpa: number): GpaBand {
  if (gpa < 2.0) return "probation";
  if (gpa < 3.0) return "satisfactory";
  if (gpa < 3.5) return "good";
  return "excellent";
}

export const GPA_GAUGE_ZONES: { key: GpaBand; from: number; to: number; colorClass: string }[] = [
  { key: "probation", from: 0, to: 2.0, colorClass: "stroke-red-500 dark:stroke-red-400" },
  { key: "satisfactory", from: 2.0, to: 3.0, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "good", from: 3.0, to: 3.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "excellent", from: 3.5, to: GPA_GAUGE_MAX, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
];

export type ScenarioCourse = { grade: LetterGrade; creditHours: string };
export type GpaScenario = { key: string; courses: ScenarioCourse[] };

/** Real, illustrative course-load scenarios (not random) used by the quick-pick chips both above the fold and in the live widget. */
export const GPA_SCENARIOS: GpaScenario[] = [
  {
    key: "deansListSemester",
    courses: [
      { grade: "A", creditHours: "3" },
      { grade: "A", creditHours: "4" },
      { grade: "A-", creditHours: "3" },
      { grade: "A", creditHours: "3" },
    ],
  },
  {
    key: "solidBSemester",
    courses: [
      { grade: "B+", creditHours: "3" },
      { grade: "B", creditHours: "4" },
      { grade: "B-", creditHours: "3" },
      { grade: "B+", creditHours: "3" },
    ],
  },
  {
    key: "mixedSemester",
    courses: [
      { grade: "A-", creditHours: "3" },
      { grade: "B", creditHours: "4" },
      { grade: "C+", creditHours: "3" },
      { grade: "B-", creditHours: "3" },
    ],
  },
  {
    key: "strugglingSemester",
    courses: [
      { grade: "C", creditHours: "3" },
      { grade: "D+", creditHours: "4" },
      { grade: "C-", creditHours: "3" },
      { grade: "D", creditHours: "3" },
    ],
  },
];
