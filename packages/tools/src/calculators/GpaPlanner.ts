/**
 * Pure GPA planning math: official grading scales, semester and cumulative
 * GPA, target planning, course-retake impact and honors standing.
 *
 * Scale sources (verified against the published documents):
 * - sa5: King Saud University, "اللائحة المنظمة للشؤون الدراسية والأكاديمية للمرحلة الجامعية"
 *   (1444H) grade table and Article 47 (first honors 4.75–5.00, second 4.25–<4.75).
 *   The same table is the unified Saudi study regulation used by most Saudi universities.
 * - sa4: the 4-point column of the same KSU table (honors 3.75 / 3.25 in the 1436H KSU rules),
 *   identical to KFUPM's grading system and graduation honors (3.750 / 3.250).
 * - us4: College Board BigFuture "How to Convert Your GPA to a 4.0 Scale" (A 90–100 = 4.0 …
 *   D 66–69 = 1.0, F = 0.0) with Latin honors from the University of Illinois Chicago
 *   registrar (summa ≥ 3.90, magna ≥ 3.75, cum laude ≥ 3.50).
 */

export type GpaScaleId = "sa5" | "sa4" | "us4";

export type GpaGradeDef = {
  letter: string;
  points: number;
  /** Inclusive lower bound of the percentage band. */
  minPercent: number;
};

export type GpaHonorDef = {
  key: "first" | "second" | "summa" | "magna" | "cum";
  min: number;
};

export type GpaScaleDef = {
  id: GpaScaleId;
  max: number;
  /** Points of the lowest grade (F). On the Saudi 5-point scale F still carries 1.00. */
  min: number;
  /** Highest letter first. */
  grades: GpaGradeDef[];
  /** Highest honor first. */
  honors: GpaHonorDef[];
};

const SA_BANDS = [95, 90, 85, 80, 75, 70, 65, 60, 0];
const SA_LETTERS = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];
const SA5_POINTS = [5, 4.75, 4.5, 4, 3.5, 3, 2.5, 2, 1];
const SA4_POINTS = [4, 3.75, 3.5, 3, 2.5, 2, 1.5, 1, 0];

export const GPA_SCALES: Record<GpaScaleId, GpaScaleDef> = {
  sa5: {
    id: "sa5",
    max: 5,
    min: 1,
    grades: SA_LETTERS.map((letter, i) => ({ letter, points: SA5_POINTS[i], minPercent: SA_BANDS[i] })),
    honors: [
      { key: "first", min: 4.75 },
      { key: "second", min: 4.25 },
    ],
  },
  sa4: {
    id: "sa4",
    max: 4,
    min: 0,
    grades: SA_LETTERS.map((letter, i) => ({ letter, points: SA4_POINTS[i], minPercent: SA_BANDS[i] })),
    honors: [
      { key: "first", min: 3.75 },
      { key: "second", min: 3.25 },
    ],
  },
  us4: {
    id: "us4",
    max: 4,
    min: 0,
    grades: [
      { letter: "A", points: 4, minPercent: 90 },
      { letter: "B", points: 3, minPercent: 80 },
      { letter: "C", points: 2, minPercent: 70 },
      { letter: "D", points: 1, minPercent: 66 },
      { letter: "F", points: 0, minPercent: 0 },
    ],
    honors: [
      { key: "summa", min: 3.9 },
      { key: "magna", min: 3.75 },
      { key: "cum", min: 3.5 },
    ],
  },
};

const round = (value: number, digits = 3) => Number(value.toFixed(digits));

export function gradeForPercent(scaleId: GpaScaleId, percent: number): GpaGradeDef {
  const grades = GPA_SCALES[scaleId].grades;
  const p = Math.min(100, Math.max(0, percent));
  return grades.find((g) => p >= g.minPercent) ?? grades[grades.length - 1];
}

export function gradeForLetter(scaleId: GpaScaleId, letter: string): GpaGradeDef {
  const grades = GPA_SCALES[scaleId].grades;
  return grades.find((g) => g.letter === letter) ?? grades[grades.length - 1];
}

/** Maps a letter onto another scale by its percentage band (used when the scale selector changes). */
export function mapLetterToScale(from: GpaScaleId, to: GpaScaleId, letter: string): string {
  return gradeForPercent(to, gradeForLetter(from, letter).minPercent).letter;
}

/**
 * Converts a cumulative GPA between the two Saudi scales. The KSU table maps every grade
 * exactly one point lower on the 4-point column (5.00→4.00 … 1.00→0.00), so the conversion is
 * exact. Returns null for pairs without an official linear relationship (US scale).
 */
export function convertSaudiGpa(value: number, from: GpaScaleId, to: GpaScaleId): number | null {
  if (from === to) return value;
  if (from === "sa5" && to === "sa4") return round(Math.max(0, value - 1));
  if (from === "sa4" && to === "sa5") return round(Math.min(5, value + 1));
  return null;
}

export type GpaCourse = { credits: number; points: number };

export type GpaTermSummary = {
  credits: number;
  qualityPoints: number;
  gpa: number;
};

export function summarizeCourses(courses: GpaCourse[]): GpaTermSummary {
  const valid = courses.filter((c) => c.credits > 0 && Number.isFinite(c.points));
  const credits = valid.reduce((s, c) => s + c.credits, 0);
  const qualityPoints = valid.reduce((s, c) => s + c.credits * c.points, 0);
  return { credits, qualityPoints: round(qualityPoints), gpa: credits > 0 ? round(qualityPoints / credits) : 0 };
}

export type GpaTimelinePoint = GpaTermSummary & {
  cumulativeCredits: number;
  cumulativeQualityPoints: number;
  cumulativeGpa: number;
};

/** Semester-by-semester record on top of a prior cumulative GPA and its completed credits. */
export function buildTimeline(priorGpa: number, priorCredits: number, terms: GpaCourse[][]): GpaTimelinePoint[] {
  let credits = Math.max(0, priorCredits);
  let qp = credits * Math.max(0, priorGpa);
  return terms.map((courses) => {
    const term = summarizeCourses(courses);
    credits += term.credits;
    qp += term.qualityPoints;
    return {
      ...term,
      cumulativeCredits: credits,
      cumulativeQualityPoints: round(qp),
      cumulativeGpa: credits > 0 ? round(qp / credits) : 0,
    };
  });
}

export type GpaTargetPlan = {
  /** Semester GPA needed over `plannedCredits` to reach the target. */
  required: number;
  status: "achievable" | "guaranteed" | "impossible";
  /** Semesters of `plannedCredits` each at the scale maximum to reach the target; null when it can never be reached. */
  semestersAtMax: number | null;
  /** Best cumulative reachable this semester (all maximum grades). */
  bestThisSemester: number;
};

export function planTarget(
  scaleId: GpaScaleId,
  currentGpa: number,
  currentCredits: number,
  target: number,
  plannedCredits: number,
): GpaTargetPlan {
  const { max, min } = GPA_SCALES[scaleId];
  const c = Math.max(0, currentCredits);
  const qp = c * currentGpa;
  const planned = Math.max(0.0001, plannedCredits);
  const required = round((target * (c + planned) - qp) / planned);
  const bestThisSemester = round((qp + max * planned) / (c + planned));

  let semestersAtMax: number | null;
  if (target * c <= qp) semestersAtMax = 0;
  else if (target >= max) semestersAtMax = null;
  else semestersAtMax = Math.ceil((target * c - qp) / (planned * (max - target)) - 1e-9);

  const status = required > max ? "impossible" : required <= min ? "guaranteed" : "achievable";
  return { required, status, semestersAtMax, bestThisSemester };
}

export type GpaRetakePolicy = "replace" | "average";

export type GpaRetakeResult = {
  before: number;
  after: number;
  delta: number;
  creditsAfter: number;
};

/**
 * replace: the new grade replaces the old one (credits unchanged).
 * average: both attempts count (KSU Article 34: "احتساب كلا التقديرين في المعدل التراكمي"),
 * so the course credits are added again with the new grade.
 */
export function retakeImpact(
  cumulativeQualityPoints: number,
  cumulativeCredits: number,
  course: GpaCourse,
  newPoints: number,
  policy: GpaRetakePolicy,
): GpaRetakeResult {
  const before = cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : 0;
  const qpAfter =
    policy === "replace"
      ? cumulativeQualityPoints - course.credits * course.points + course.credits * newPoints
      : cumulativeQualityPoints + course.credits * newPoints;
  const creditsAfter = policy === "replace" ? cumulativeCredits : cumulativeCredits + course.credits;
  const after = creditsAfter > 0 ? qpAfter / creditsAfter : 0;
  return { before: round(before), after: round(after), delta: round(after - before), creditsAfter };
}

export type GpaHonorStanding = {
  /** Highest honor currently met, or null. */
  current: GpaHonorDef["key"] | null;
  gaps: { key: GpaHonorDef["key"]; min: number; gap: number; met: boolean }[];
};

export function honorsStanding(scaleId: GpaScaleId, gpa: number): GpaHonorStanding {
  const honors = GPA_SCALES[scaleId].honors;
  const gaps = honors.map((h) => ({ key: h.key, min: h.min, gap: round(Math.max(0, h.min - gpa)), met: gpa >= h.min }));
  return { current: gaps.find((g) => g.met)?.key ?? null, gaps };
}

/** Each course's pull on the term GPA: (points − term GPA) × credits ÷ term credits. Sums to 0. */
export function courseContributions(courses: GpaCourse[]): { share: number; pull: number; qualityPoints: number }[] {
  const term = summarizeCourses(courses);
  return courses.map((c) => ({
    share: term.credits > 0 && c.credits > 0 ? round(c.credits / term.credits, 4) : 0,
    pull: term.credits > 0 && c.credits > 0 ? round(((c.points - term.gpa) * c.credits) / term.credits, 4) : 0,
    qualityPoints: round(Math.max(0, c.credits) * c.points),
  }));
}
