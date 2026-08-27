import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ScientificNotationOperation = "toScientific" | "toStandard" | "multiply" | "divide";

export type ScientificNotationInput = {
  operation: ScientificNotationOperation;
  standardValue: number;
  coefficientA: number;
  exponentA: number;
  coefficientB: number;
  exponentB: number;
};

export type NormalizedScientific = {
  coefficient: number;
  exponent: number;
};

export type NumberNameKey =
  | "thousand"
  | "million"
  | "billion"
  | "trillion"
  | "quadrillion"
  | "thousandth"
  | "millionth"
  | "billionth"
  | "trillionth";

export type ScientificNotationError = "divide-by-zero";

export type ScientificNotationOutput = {
  error: ScientificNotationError | null;
  standard: number;
  scientific: NormalizedScientific;
  engineering: NormalizedScientific;
  numberName: NumberNameKey | null;
};

const NAME_BY_EXPONENT: Record<number, NumberNameKey> = {
  3: "thousand",
  6: "million",
  9: "billion",
  12: "trillion",
  15: "quadrillion",
  "-3": "thousandth",
  "-6": "millionth",
  "-9": "billionth",
  "-12": "trillionth",
};

function normalize(coefficient: number, exponent: number): NormalizedScientific {
  if (coefficient === 0) return { coefficient: 0, exponent: 0 };
  let c = coefficient;
  let e = exponent;
  while (Math.abs(c) >= 10) {
    c /= 10;
    e += 1;
  }
  while (Math.abs(c) < 1) {
    c *= 10;
    e -= 1;
  }
  return { coefficient: Number(c.toPrecision(12)), exponent: e };
}

function toEngineering(coefficient: number, exponent: number): NormalizedScientific {
  if (coefficient === 0) return { coefficient: 0, exponent: 0 };
  const mod = ((exponent % 3) + 3) % 3;
  const engExponent = exponent - mod;
  const engCoefficient = coefficient * Math.pow(10, mod);
  return { coefficient: Number(engCoefficient.toPrecision(12)), exponent: engExponent };
}

function toStandardNumber(coefficient: number, exponent: number): number {
  return Number((coefficient * Math.pow(10, exponent)).toPrecision(12));
}

export class ScientificNotationConverter extends BaseCalculator<
  ScientificNotationInput,
  ScientificNotationOutput
> {
  metadata = {
    id: "scientific-notation-converter",
    slug: "scientific-notation-converter",
    name: "Scientific Notation Converter",
    category: "math-science",
    description: "Convert numbers between standard and scientific notation, and multiply or divide values already in scientific notation.",
    version: "1.0.0",
  };

  execute(
    input: ScientificNotationInput,
    _context: ToolContext
  ): ToolResult<ScientificNotationOutput> {
    const { operation, standardValue, coefficientA, exponentA, coefficientB, exponentB } = input;

    let scientific: NormalizedScientific;
    let error: ScientificNotationError | null = null;

    if (operation === "toScientific") {
      scientific = normalize(standardValue, 0);
    } else if (operation === "toStandard") {
      scientific = normalize(coefficientA, exponentA);
    } else if (operation === "multiply") {
      scientific = normalize(coefficientA * coefficientB, exponentA + exponentB);
    } else {
      if (coefficientB === 0) {
        error = "divide-by-zero";
        scientific = { coefficient: 0, exponent: 0 };
      } else {
        scientific = normalize(coefficientA / coefficientB, exponentA - exponentB);
      }
    }

    const standard =
      operation === "toStandard"
        ? toStandardNumber(coefficientA, exponentA)
        : toStandardNumber(scientific.coefficient, scientific.exponent);
    const engineering = toEngineering(scientific.coefficient, scientific.exponent);
    const numberName = NAME_BY_EXPONENT[engineering.exponent] ?? null;

    return {
      success: true,
      data: { error, standard, scientific, engineering, numberName },
      metadata: {},
    };
  }
}
