import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type RomanConversionDirection = "toRoman" | "toArabic";

export type RomanNumeralInput = {
  direction: RomanConversionDirection;
  arabicValue?: number;
  romanValue?: string;
};

export type RomanNumeralError = "out-of-range" | "invalid-roman" | "empty-input";

export type RomanNumeralOutput = {
  error: RomanNumeralError | null;
  arabicValue: number | null;
  romanValue: string | null;
};

const VALUE_SYMBOL_PAIRS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const ROMAN_LETTER_VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

const MIN_VALUE = 1;
const MAX_VALUE = 3999;

function arabicToRoman(value: number): string {
  let remaining = value;
  let result = "";
  for (const [amount, symbol] of VALUE_SYMBOL_PAIRS) {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  }
  return result;
}

function romanToArabic(roman: string): number | null {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = ROMAN_LETTER_VALUES[roman[i]];
    const next = ROMAN_LETTER_VALUES[roman[i + 1]];
    if (current === undefined) return null;
    if (next !== undefined && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

export class RomanNumeralCalculator extends BaseCalculator<RomanNumeralInput, RomanNumeralOutput> {
  metadata = {
    id: "roman-numeral-converter",
    slug: "roman-numeral-converter",
    name: "Roman Numeral Converter",
    category: "converters",
    description: "Convert between Arabic numerals and Roman numerals in both directions.",
    version: "1.0.0",
  };

  execute(input: RomanNumeralInput, _context: ToolContext): ToolResult<RomanNumeralOutput> {
    if (input.direction === "toRoman") {
      const value = input.arabicValue;
      if (value === undefined || !Number.isFinite(value)) {
        return this.error("empty-input");
      }
      if (!Number.isInteger(value) || value < MIN_VALUE || value > MAX_VALUE) {
        return this.error("out-of-range");
      }
      return {
        success: true,
        data: { error: null, arabicValue: value, romanValue: arabicToRoman(value) },
        metadata: {},
      };
    }

    const raw = (input.romanValue ?? "").trim().toUpperCase();
    if (!raw) {
      return this.error("empty-input");
    }
    if (!/^[IVXLCDM]+$/.test(raw)) {
      return this.error("invalid-roman");
    }

    const parsed = romanToArabic(raw);
    if (parsed === null || parsed < MIN_VALUE || parsed > MAX_VALUE) {
      return this.error("invalid-roman");
    }

    // A valid standard Roman numeral round-trips exactly back to its canonical form —
    // this rejects malformed input like "IIII" or "VX" that a naive sum would accept.
    if (arabicToRoman(parsed) !== raw) {
      return this.error("invalid-roman");
    }

    return {
      success: true,
      data: { error: null, arabicValue: parsed, romanValue: raw },
      metadata: {},
    };
  }

  private error(error: RomanNumeralError): ToolResult<RomanNumeralOutput> {
    return { success: true, data: { error, arabicValue: null, romanValue: null }, metadata: {} };
  }
}
