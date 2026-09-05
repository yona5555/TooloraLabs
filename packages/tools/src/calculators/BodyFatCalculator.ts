import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import type { Gender } from "./BMICalculator";

export type BodyFatCalculatorInput = {
  gender: Gender;
  /** All measurements in centimeters. */
  heightCm: number;
  neckCm: number;
  waistCm: number;
  /** Required for women; ignored for men. */
  hipCm?: number;
};

export type BodyFatCategory = "essential" | "athletes" | "fitness" | "average" | "obese";

export type BodyFatCalculatorError = "invalid-measurements";

export type BodyFatCalculatorOutput = {
  error: BodyFatCalculatorError | null;
  bodyFatPercent: number;
  category: BodyFatCategory | null;
};

const CM_TO_IN = 1 / 2.54;

/** Category thresholds per the American Council on Exercise (ACE) body fat classification. */
const CATEGORY_THRESHOLDS: Record<Gender, { category: BodyFatCategory; max: number }[]> = {
  male: [
    { category: "essential", max: 5 },
    { category: "athletes", max: 13 },
    { category: "fitness", max: 17 },
    { category: "average", max: 24 },
    { category: "obese", max: Infinity },
  ],
  female: [
    { category: "essential", max: 13 },
    { category: "athletes", max: 20 },
    { category: "fitness", max: 24 },
    { category: "average", max: 31 },
    { category: "obese", max: Infinity },
  ],
};

function categorize(gender: Gender, bodyFatPercent: number): BodyFatCategory {
  const thresholds = CATEGORY_THRESHOLDS[gender];
  return thresholds.find((t) => bodyFatPercent <= t.max)!.category;
}

/**
 * The US Navy circumference method (Hodgdon & Beckett, 1984): estimates body fat from a
 * handful of tape-measure circumferences rather than skinfold calipers or imaging, trading
 * some precision for a measurement anyone can take at home. Uses log10 of circumference
 * differences, in inches, per the original published formula.
 */
export class BodyFatCalculator extends BaseCalculator<BodyFatCalculatorInput, BodyFatCalculatorOutput> {
  metadata = {
    id: "body-fat-calculator",
    slug: "body-fat-calculator",
    name: "Body Fat Calculator",
    category: "health-fitness",
    description: "Estimate body fat percentage from neck, waist, and (for women) hip circumference using the US Navy method.",
    version: "1.0.0",
  };

  execute(input: BodyFatCalculatorInput, _context: ToolContext): ToolResult<BodyFatCalculatorOutput> {
    const { gender, heightCm, neckCm, waistCm, hipCm } = input;

    const valid =
      Number.isFinite(heightCm) &&
      heightCm > 0 &&
      Number.isFinite(neckCm) &&
      neckCm > 0 &&
      Number.isFinite(waistCm) &&
      waistCm > 0 &&
      waistCm > neckCm &&
      (gender === "male" || (Number.isFinite(hipCm) && (hipCm as number) > 0 && waistCm + (hipCm as number) > neckCm));

    if (!valid) {
      return this.error("invalid-measurements");
    }

    const heightIn = heightCm * CM_TO_IN;
    const neckIn = neckCm * CM_TO_IN;
    const waistIn = waistCm * CM_TO_IN;

    let bodyFatPercent: number;
    if (gender === "male") {
      bodyFatPercent = 86.01 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
    } else {
      const hipIn = (hipCm as number) * CM_TO_IN;
      bodyFatPercent = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
    }

    bodyFatPercent = Math.max(bodyFatPercent, 0);

    return {
      success: true,
      data: { error: null, bodyFatPercent, category: categorize(gender, bodyFatPercent) },
      metadata: {},
    };
  }

  private error(error: BodyFatCalculatorError): ToolResult<BodyFatCalculatorOutput> {
    return { success: true, data: { error, bodyFatPercent: 0, category: null }, metadata: {} };
  }
}
