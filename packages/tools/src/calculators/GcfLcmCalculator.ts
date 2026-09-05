import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type GcfLcmCalculatorInput = {
  numbers: number[];
};

export type PrimeFactor = { prime: number; exponent: number };

export type GcfLcmCalculatorError = "too-few-numbers" | "invalid-number";

export type GcfLcmCalculatorOutput = {
  error: GcfLcmCalculatorError | null;
  gcf: number;
  lcm: number;
  factorizations: PrimeFactor[][];
};

function gcdPair(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function lcmPair(a: number, b: number): number {
  const divisor = gcdPair(a, b);
  return divisor === 0 ? 0 : Math.abs(a * b) / divisor;
}

function primeFactorize(n: number): PrimeFactor[] {
  const factors: PrimeFactor[] = [];
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      let exponent = 0;
      while (remaining % p === 0) {
        remaining /= p;
        exponent++;
      }
      factors.push({ prime: p, exponent });
    }
  }
  if (remaining > 1) factors.push({ prime: remaining, exponent: 1 });
  return factors;
}

/**
 * Computes the greatest common factor and least common multiple of a list of two or
 * more positive integers, reducing pairwise (GCF(a, b, c) = GCF(GCF(a, b), c), and
 * similarly for LCM), and returns each number's prime factorization alongside the result
 * so the "why" is visible, not just the final numbers.
 */
export class GcfLcmCalculator extends BaseCalculator<GcfLcmCalculatorInput, GcfLcmCalculatorOutput> {
  metadata = {
    id: "gcf-lcm-calculator",
    slug: "gcf-lcm-calculator",
    name: "GCF & LCM Calculator",
    category: "math-science",
    description: "Find the greatest common factor and least common multiple of two or more numbers, with prime factorizations shown.",
    version: "1.0.0",
  };

  execute(input: GcfLcmCalculatorInput, _context: ToolContext): ToolResult<GcfLcmCalculatorOutput> {
    const { numbers } = input;

    if (numbers.length < 2) {
      return this.error("too-few-numbers");
    }

    for (const n of numbers) {
      if (!Number.isInteger(n) || n < 1) {
        return this.error("invalid-number");
      }
    }

    const gcf = numbers.reduce((acc, n) => gcdPair(acc, n));
    const lcm = numbers.reduce((acc, n) => lcmPair(acc, n));
    const factorizations = numbers.map((n) => primeFactorize(n));

    return {
      success: true,
      data: { error: null, gcf, lcm, factorizations },
      metadata: {},
    };
  }

  private error(error: GcfLcmCalculatorError): ToolResult<GcfLcmCalculatorOutput> {
    return { success: true, data: { error, gcf: 0, lcm: 0, factorizations: [] }, metadata: {} };
  }
}
