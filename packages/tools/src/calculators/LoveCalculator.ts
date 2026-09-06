import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type LoveCalculatorInput = {
  name1: string;
  name2: string;
};

export type LoveCalculatorError = "empty-name";

export type LoveCalculatorOutput = {
  error: LoveCalculatorError | null;
  percentage: number;
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Simple deterministic string hash (Java-style 31-multiplier), order-independent between the two names. */
function hashCompatibility(name1: string, name2: string): number {
  const combined = [name1, name2].sort().join("+");
  let hash = 0;
  for (const char of combined) {
    const codePoint = char.codePointAt(0) ?? 0;
    hash = (hash * 31 + codePoint) | 0;
  }
  return Math.abs(hash) % 101;
}

export class LoveCalculator extends BaseCalculator<LoveCalculatorInput, LoveCalculatorOutput> {
  metadata = {
    id: "love-calculator",
    slug: "love-calculator",
    name: "Love Calculator",
    category: "fun-entertainment",
    description: "A fun, name-based compatibility percentage calculator for entertainment purposes only.",
    version: "1.0.0",
  };

  execute(input: LoveCalculatorInput, _context: ToolContext): ToolResult<LoveCalculatorOutput> {
    const name1 = normalizeName(input.name1 ?? "");
    const name2 = normalizeName(input.name2 ?? "");

    if (!name1 || !name2) {
      return {
        success: true,
        data: { error: "empty-name", percentage: 0 },
        metadata: {},
      };
    }

    const percentage = hashCompatibility(name1, name2);

    return {
      success: true,
      data: { error: null, percentage },
      metadata: {},
    };
  }
}
