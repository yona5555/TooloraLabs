import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type FractionOperation = "add" | "subtract" | "multiply" | "divide";

export type FractionCalculatorInput = {
  operation: FractionOperation;
  numeratorA: number;
  denominatorA: number;
  numeratorB: number;
  denominatorB: number;
};

export type SimpleFraction = {
  numerator: number;
  denominator: number;
};

export type MixedNumber = {
  whole: number;
  numerator: number;
  denominator: number;
};

export type FractionCalculatorError = "zero-denominator" | "divide-by-zero";

export type FractionCalculatorOutput = {
  error: FractionCalculatorError | null;
  simplifiedA: SimpleFraction;
  simplifiedB: SimpleFraction;
  result: SimpleFraction;
  decimal: number;
  isWholeNumber: boolean;
  isImproper: boolean;
  mixed: MixedNumber | null;
  /** Least common denominator used for add/subtract; null for multiply/divide. */
  commonDenominator: number | null;
  /** Numerators of A and B once scaled up to the common denominator; null for multiply/divide. */
  scaledNumeratorA: number | null;
  scaledNumeratorB: number | null;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function simplify(numerator: number, denominator: number): SimpleFraction {
  const sign = denominator < 0 ? -1 : 1;
  const num = sign * numerator;
  const den = sign * denominator;
  const divisor = gcd(num, den);
  return { numerator: num / divisor, denominator: den / divisor };
}

function toMixedNumber(numerator: number, denominator: number): MixedNumber | null {
  if (denominator === 1 || Math.abs(numerator) < denominator) return null;
  const whole = Math.trunc(numerator / denominator);
  const remainder = Math.abs(numerator - whole * denominator);
  if (remainder === 0) return null;
  return { whole, numerator: remainder, denominator };
}

const EMPTY_FRACTION: SimpleFraction = { numerator: 0, denominator: 1 };

export class FractionCalculator extends BaseCalculator<FractionCalculatorInput, FractionCalculatorOutput> {
  metadata = {
    id: "fraction-calculator",
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    category: "math-science",
    description: "Add, subtract, multiply, and divide fractions with full simplified steps.",
    version: "1.0.0",
  };

  execute(
    input: FractionCalculatorInput,
    _context: ToolContext
  ): ToolResult<FractionCalculatorOutput> {
    const { operation, numeratorA, denominatorA, numeratorB, denominatorB } = input;

    if (denominatorA === 0 || denominatorB === 0) {
      return {
        success: true,
        data: {
          error: "zero-denominator",
          simplifiedA: EMPTY_FRACTION,
          simplifiedB: EMPTY_FRACTION,
          result: EMPTY_FRACTION,
          decimal: 0,
          isWholeNumber: false,
          isImproper: false,
          mixed: null,
          commonDenominator: null,
          scaledNumeratorA: null,
          scaledNumeratorB: null,
        },
        metadata: {},
      };
    }

    const simplifiedA = simplify(numeratorA, denominatorA);
    const simplifiedB = simplify(numeratorB, denominatorB);

    if (operation === "divide" && numeratorB === 0) {
      return {
        success: true,
        data: {
          error: "divide-by-zero",
          simplifiedA,
          simplifiedB,
          result: EMPTY_FRACTION,
          decimal: 0,
          isWholeNumber: false,
          isImproper: false,
          mixed: null,
          commonDenominator: null,
          scaledNumeratorA: null,
          scaledNumeratorB: null,
        },
        metadata: {},
      };
    }

    let resultNumerator: number;
    let resultDenominator: number;
    let commonDenominator: number | null = null;
    let scaledNumeratorA: number | null = null;
    let scaledNumeratorB: number | null = null;

    if (operation === "add" || operation === "subtract") {
      const lcd = lcm(denominatorA, denominatorB);
      scaledNumeratorA = numeratorA * (lcd / denominatorA);
      scaledNumeratorB = numeratorB * (lcd / denominatorB);
      commonDenominator = lcd;
      resultNumerator = operation === "add" ? scaledNumeratorA + scaledNumeratorB : scaledNumeratorA - scaledNumeratorB;
      resultDenominator = lcd;
    } else if (operation === "multiply") {
      resultNumerator = numeratorA * numeratorB;
      resultDenominator = denominatorA * denominatorB;
    } else {
      resultNumerator = numeratorA * denominatorB;
      resultDenominator = denominatorA * numeratorB;
    }

    const result = simplify(resultNumerator, resultDenominator);
    const decimal = Number((result.numerator / result.denominator).toFixed(6));
    const isWholeNumber = result.denominator === 1;
    const mixed = toMixedNumber(result.numerator, result.denominator);

    return {
      success: true,
      data: {
        error: null,
        simplifiedA,
        simplifiedB,
        result,
        decimal,
        isWholeNumber,
        isImproper: mixed !== null,
        mixed,
        commonDenominator,
        scaledNumeratorA,
        scaledNumeratorB,
      },
      metadata: {},
    };
  }
}
