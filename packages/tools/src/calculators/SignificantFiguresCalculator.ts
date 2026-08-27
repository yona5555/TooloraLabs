import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import type { NormalizedScientific } from "./ScientificNotationConverter";

export type SignificantFiguresOperation = "count" | "round" | "add" | "subtract" | "multiply" | "divide";

export type SignificantFiguresInput = {
  operation: SignificantFiguresOperation;
  rawValueA: string;
  rawValueB: string;
  roundToDigits: number;
};

export type SignificantFiguresError = "invalid-number" | "divide-by-zero";

export type SignificantFiguresOutput = {
  error: SignificantFiguresError | null;
  sigFigsA: number;
  sigFigsB: number | null;
  decimalPlacesA: number;
  decimalPlacesB: number | null;
  rawResult: number;
  roundedResult: number;
  resultSigFigs: number | null;
  resultDecimalPlaces: number | null;
  resultScientific: NormalizedScientific;
};

/**
 * Significant figures are a property of how a number was WRITTEN, not just
 * its numeric value — "100" and "100." carry different amounts of implied
 * precision despite being numerically equal. Every count/round/precision
 * rule here therefore operates on the raw digit string, never on a
 * pre-parsed number that has already discarded that information.
 */
export function countSignificantFigures(raw: string): number {
  const s = raw.trim().replace(/^[+-]/, "");
  if (s === "" || s === ".") return 0;

  if (s.includes(".")) {
    const digitsOnly = s.replace(".", "");
    const firstNonZero = digitsOnly.search(/[1-9]/);
    if (firstNonZero === -1) {
      const afterDecimal = s.split(".")[1] ?? "";
      return afterDecimal.length;
    }
    return digitsOnly.length - firstNonZero;
  }

  const trimmedLeading = s.replace(/^0+/, "");
  if (trimmedLeading === "") return 0;
  const trimmedTrailing = trimmedLeading.replace(/0+$/, "");
  return trimmedTrailing.length === 0 ? 1 : trimmedTrailing.length;
}

export function countDecimalPlaces(raw: string): number {
  const s = raw.trim();
  if (!s.includes(".")) return 0;
  return s.split(".")[1]?.length ?? 0;
}

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

export function roundToSigFigs(value: number, sigFigs: number): number {
  if (value === 0 || sigFigs <= 0) return 0;
  const magnitudeExponent = Math.floor(Math.log10(Math.abs(value))) + 1;
  const power = sigFigs - magnitudeExponent;
  const scale = Math.pow(10, power);
  return Math.round(value * scale) / scale;
}

function roundToDecimalPlaces(value: number, places: number): number {
  const scale = Math.pow(10, places);
  return Math.round(value * scale) / scale;
}

export class SignificantFiguresCalculator extends BaseCalculator<
  SignificantFiguresInput,
  SignificantFiguresOutput
> {
  metadata = {
    id: "significant-figures-calculator",
    slug: "significant-figures-calculator",
    name: "Significant Figures Calculator",
    category: "math-science",
    description: "Count significant figures, round to a chosen number of them, and propagate measurement precision correctly through arithmetic.",
    version: "1.0.0",
  };

  execute(
    input: SignificantFiguresInput,
    _context: ToolContext
  ): ToolResult<SignificantFiguresOutput> {
    const { operation, rawValueA, rawValueB, roundToDigits } = input;

    const valueA = Number(rawValueA);
    const valueB = Number(rawValueB);

    if (!Number.isFinite(valueA) || (operation !== "count" && operation !== "round" && !Number.isFinite(valueB))) {
      return {
        success: true,
        data: {
          error: "invalid-number",
          sigFigsA: 0,
          sigFigsB: null,
          decimalPlacesA: 0,
          decimalPlacesB: null,
          rawResult: 0,
          roundedResult: 0,
          resultSigFigs: null,
          resultDecimalPlaces: null,
          resultScientific: { coefficient: 0, exponent: 0 },
        },
        metadata: {},
      };
    }

    const sigFigsA = countSignificantFigures(rawValueA);
    const decimalPlacesA = countDecimalPlaces(rawValueA);

    const needsB = operation === "add" || operation === "subtract" || operation === "multiply" || operation === "divide";
    const sigFigsB = needsB ? countSignificantFigures(rawValueB) : null;
    const decimalPlacesB = needsB ? countDecimalPlaces(rawValueB) : null;

    if (operation === "divide" && valueB === 0) {
      return {
        success: true,
        data: {
          error: "divide-by-zero",
          sigFigsA,
          sigFigsB,
          decimalPlacesA,
          decimalPlacesB,
          rawResult: 0,
          roundedResult: 0,
          resultSigFigs: null,
          resultDecimalPlaces: null,
          resultScientific: { coefficient: 0, exponent: 0 },
        },
        metadata: {},
      };
    }

    let rawResult: number;
    let roundedResult: number;
    let resultSigFigs: number | null = null;
    let resultDecimalPlaces: number | null = null;

    if (operation === "count") {
      rawResult = valueA;
      roundedResult = valueA;
      resultSigFigs = sigFigsA;
    } else if (operation === "round") {
      rawResult = valueA;
      roundedResult = roundToSigFigs(valueA, roundToDigits);
      resultSigFigs = roundToDigits;
    } else if (operation === "add" || operation === "subtract") {
      rawResult = operation === "add" ? valueA + valueB : valueA - valueB;
      resultDecimalPlaces = Math.min(decimalPlacesA, decimalPlacesB ?? 0);
      roundedResult = roundToDecimalPlaces(rawResult, resultDecimalPlaces);
    } else {
      rawResult = operation === "multiply" ? valueA * valueB : valueA / valueB;
      resultSigFigs = Math.min(sigFigsA, sigFigsB ?? 0);
      roundedResult = roundToSigFigs(rawResult, resultSigFigs);
    }

    const resultScientific = normalize(roundedResult, 0);

    return {
      success: true,
      data: {
        error: null,
        sigFigsA,
        sigFigsB,
        decimalPlacesA,
        decimalPlacesB,
        rawResult,
        roundedResult,
        resultSigFigs,
        resultDecimalPlaces,
        resultScientific,
      },
      metadata: {},
    };
  }
}
