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
