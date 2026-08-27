import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type GpaOperation = "calculate" | "target";

export type GpaCourseInput = {
  gradePoints: number;
  creditHours: number;
};

export type GpaCalculatorInput = {
  operation: GpaOperation;
  courses: GpaCourseInput[];
  currentGpa: number;
  currentCredits: number;
  targetGpa: number;
  plannedCredits: number;
};

export type GpaCalculatorError = "no-courses" | "invalid-planned-credits";

export type GpaCalculatorOutput = {
  error: GpaCalculatorError | null;
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  requiredGpa: number | null;
  isAchievable: boolean | null;
};

const MAX_SCALE = 4.0;

export class GpaCalculator extends BaseCalculator<GpaCalculatorInput, GpaCalculatorOutput> {
  metadata = {
    id: "gpa-calculator",
    slug: "gpa-calculator",
    name: "GPA / Grade Calculator",
    category: "math-science",
    description: "Calculate a credit-weighted grade point average, and find the GPA needed on upcoming credits to reach a target.",
    version: "1.0.0",
  };

  execute(input: GpaCalculatorInput, _context: ToolContext): ToolResult<GpaCalculatorOutput> {
    const { operation, courses, currentGpa, currentCredits, targetGpa, plannedCredits } = input;

    if (operation === "calculate") {
      const validCourses = courses.filter((c) => c.creditHours > 0);
      const totalCredits = validCourses.reduce((sum, c) => sum + c.creditHours, 0);

      if (validCourses.length === 0 || totalCredits === 0) {
        return {
          success: true,
          data: {
            error: "no-courses",
            gpa: 0,
            totalCredits: 0,
            totalQualityPoints: 0,
            requiredGpa: null,
            isAchievable: null,
          },
          metadata: {},
        };
      }

      const totalQualityPoints = validCourses.reduce((sum, c) => sum + c.gradePoints * c.creditHours, 0);
      const gpa = Number((totalQualityPoints / totalCredits).toFixed(3));

      return {
        success: true,
        data: {
          error: null,
          gpa,
          totalCredits,
          totalQualityPoints: Number(totalQualityPoints.toFixed(3)),
          requiredGpa: null,
          isAchievable: null,
        },
        metadata: {},
      };
    }

    if (plannedCredits <= 0) {
      return {
        success: true,
        data: {
          error: "invalid-planned-credits",
          gpa: 0,
          totalCredits: 0,
          totalQualityPoints: 0,
          requiredGpa: null,
          isAchievable: null,
        },
        metadata: {},
      };
    }

    const currentQualityPoints = currentGpa * currentCredits;
    const totalCreditsAfter = currentCredits + plannedCredits;
    const requiredTotalQualityPoints = targetGpa * totalCreditsAfter;
    const neededFromPlanned = requiredTotalQualityPoints - currentQualityPoints;
    const requiredGpa = Number((neededFromPlanned / plannedCredits).toFixed(3));
    const isAchievable = requiredGpa >= 0 && requiredGpa <= MAX_SCALE;

    return {
      success: true,
      data: {
        error: null,
        gpa: currentGpa,
        totalCredits: totalCreditsAfter,
        totalQualityPoints: Number(requiredTotalQualityPoints.toFixed(3)),
        requiredGpa,
        isAchievable,
      },
      metadata: {},
    };
  }
}
