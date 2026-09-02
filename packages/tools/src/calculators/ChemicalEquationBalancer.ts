import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { parseFormula, FormulaParseError } from "./MolarMassCalculator";

export type ChemicalEquationBalancerInput = {
  equation: string;
};

export type ChemicalEquationBalancerError = "empty-equation" | "invalid-equation" | "unknown-element" | "cannot-balance";

export type BalancedTerm = {
  formula: string;
  coefficient: number;
  side: "reactant" | "product";
};

export type ChemicalEquationBalancerOutput = {
  error: ChemicalEquationBalancerError | null;
  errorDetail: string | null;
  balancedEquation: string;
  terms: BalancedTerm[];
};

// Exact rational arithmetic (as a ratio of bigints) so Gaussian elimination
// never accumulates floating-point error — critical for landing on exact
// small-integer coefficients rather than "close enough" decimals.
//
// BigInt values are built with BigInt(...) rather than the `0n` literal
// syntax throughout this file: literal syntax requires an ES2020+ compile
// target, but the BigInt type itself works under this project's ES2017
// target as long as the runtime supports it.
const ZERO = BigInt(0);
const ONE = BigInt(1);

class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint, den: bigint) {
    if (den === ZERO) throw new Error("Division by zero in Fraction");
    if (den < ZERO) {
      num = -num;
      den = -den;
    }
    const g = gcdBig(absBig(num), den) || ONE;
    this.num = num / g;
    this.den = den / g;
  }

  static fromInt(n: number): Fraction {
    return new Fraction(BigInt(n), ONE);
  }

  add(o: Fraction): Fraction {
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }
  sub(o: Fraction): Fraction {
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }
  mul(o: Fraction): Fraction {
    return new Fraction(this.num * o.num, this.den * o.den);
  }
  div(o: Fraction): Fraction {
    return new Fraction(this.num * o.den, this.den * o.num);
  }
  isZero(): boolean {
    return this.num === ZERO;
  }
  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }
}

function gcdBig(a: bigint, b: bigint): bigint {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
function absBig(a: bigint): bigint {
  return a < ZERO ? -a : a;
}
function lcmBig(a: bigint, b: bigint): bigint {
  return (absBig(a) / gcdBig(a, b)) * absBig(b);
}

type Term = { formula: string; side: "reactant" | "product" };

function splitEquation(rawEquation: string): { reactants: string[]; products: string[] } | null {
  const equation = rawEquation.trim();
  const arrowMatch = equation.match(/->|-->|=|→/);
  if (!arrowMatch) return null;

  const [left, right] = [equation.slice(0, arrowMatch.index), equation.slice((arrowMatch.index ?? 0) + arrowMatch[0].length)];
  const splitSide = (side: string) =>
    side
      .split("+")
      .map((term) => term.trim().replace(/^\d+\s*/, "")) // strip any pre-existing coefficient; we recompute from scratch
      .filter((term) => term.length > 0);

  const reactants = splitSide(left);
  const products = splitSide(right);
  if (reactants.length === 0 || products.length === 0) return null;
  return { reactants, products };
}

/**
 * Balances a chemical equation by finding the null space of the element x
 * term coefficient matrix (reactant columns positive, product columns
 * negative) using exact-fraction Gaussian elimination, then scaling the
 * result to the smallest positive integers. This is the standard "matrix
 * method" for equation balancing, generalized beyond simple trial and error.
 */
export class ChemicalEquationBalancer extends BaseCalculator<ChemicalEquationBalancerInput, ChemicalEquationBalancerOutput> {
  metadata = {
    id: "chemical-equation-balancer",
    slug: "chemical-equation-balancer",
    name: "Chemical Equation Balancer",
    category: "math-science",
    description: "Balance a chemical equation by finding the smallest whole-number coefficients that conserve every element.",
    version: "1.0.0",
  };

  execute(input: ChemicalEquationBalancerInput, _context: ToolContext): ToolResult<ChemicalEquationBalancerOutput> {
    const trimmed = input.equation.trim();
    if (trimmed.length === 0) {
      return this.errorResult("empty-equation", "Enter a chemical equation.");
    }

    const split = splitEquation(trimmed);
    if (!split) {
      return this.errorResult("invalid-equation", "Use ->, =, or → to separate reactants from products, and + between terms on each side.");
    }

    const terms: Term[] = [
      ...split.reactants.map((formula) => ({ formula, side: "reactant" as const })),
      ...split.products.map((formula) => ({ formula, side: "product" as const })),
    ];

    let termCounts: Record<string, number>[];
    try {
      termCounts = terms.map((term) => parseFormula(term.formula));
    } catch (err) {
      if (err instanceof FormulaParseError) {
        return this.errorResult(err.code === "unknown-element" ? "unknown-element" : "invalid-equation", err.message);
      }
      return this.errorResult("invalid-equation", "Could not parse one of the formulas in this equation.");
    }

    const elements = Array.from(new Set(termCounts.flatMap((counts) => Object.keys(counts)))).sort();
    const n = terms.length;
    const m = elements.length;

    // matrix[row][col]: signed count of `elements[row]` in `terms[col]`
    // (positive for reactants, negative for products), so a balanced
    // equation is exactly a vector x with matrix * x = 0.
    const matrix: Fraction[][] = elements.map((element) =>
      terms.map((term, col) => {
        const count = termCounts[col][element] ?? 0;
        const signed = term.side === "reactant" ? count : -count;
        return Fraction.fromInt(signed);
      })
    );

    const pivotCols = reduceToRref(matrix, m, n);
    const freeCols = Array.from({ length: n }, (_, i) => i).filter((i) => !pivotCols.includes(i));

    if (freeCols.length === 0) {
      return this.errorResult("cannot-balance", "This equation has no non-trivial balanced solution — check the formulas for typos.");
    }

    // Set the last free variable to 1 and every other free variable to 0;
    // this is the standard choice for chemical equations, which generically
    // have exactly one degree of freedom (the overall scale).
    const x: Fraction[] = new Array(n).fill(null);
    const chosenFree = freeCols[freeCols.length - 1];
    for (const col of freeCols) {
      x[col] = col === chosenFree ? Fraction.fromInt(1) : Fraction.fromInt(0);
    }
    for (let r = 0; r < pivotCols.length; r++) {
      const col = pivotCols[r];
      let value = Fraction.fromInt(0);
      for (const freeCol of freeCols) {
        value = value.sub(matrix[r][freeCol].mul(x[freeCol]));
      }
      x[col] = value;
    }

    let denomLcm = ONE;
    for (const f of x) denomLcm = lcmBig(denomLcm, f.den);
    let integers = x.map((f) => (f.num * (denomLcm / f.den)) as bigint);

    let gcdAll = ZERO;
    for (const v of integers) gcdAll = gcdBig(gcdAll, absBig(v));
    if (gcdAll > ONE) integers = integers.map((v) => v / gcdAll);

    if (integers.some((v) => v <= ZERO)) {
      return this.errorResult("cannot-balance", "Could not find a whole-number balance for this equation — check the formulas for typos.");
    }

    const coefficients = integers.map((v) => Number(v));
    const balancedTerms: BalancedTerm[] = terms.map((term, i) => ({ formula: term.formula, coefficient: coefficients[i], side: term.side }));

    const sideToString = (side: "reactant" | "product") =>
      balancedTerms
        .filter((t) => t.side === side)
        .map((t) => (t.coefficient === 1 ? t.formula : `${t.coefficient}${t.formula}`))
        .join(" + ");

    const balancedEquation = `${sideToString("reactant")} → ${sideToString("product")}`;

    return {
      success: true,
      data: { error: null, errorDetail: null, balancedEquation, terms: balancedTerms },
      metadata: {},
    };
  }

  private errorResult(error: ChemicalEquationBalancerError, detail: string): ToolResult<ChemicalEquationBalancerOutput> {
    return {
      success: true,
      data: { error, errorDetail: detail, balancedEquation: "", terms: [] },
      metadata: {},
    };
  }
}

/**
 * Reduces `matrix` (m rows x n cols) to reduced row-echelon form in place
 * and returns the column index chosen as pivot for each row that has one.
 */
function reduceToRref(matrix: Fraction[][], m: number, n: number): number[] {
  const pivotCols: number[] = [];
  let row = 0;

  for (let col = 0; col < n && row < m; col++) {
    let pivotRow = -1;
    for (let r = row; r < m; r++) {
      if (!matrix[r][col].isZero()) {
        pivotRow = r;
        break;
      }
    }
    if (pivotRow === -1) continue;

    [matrix[row], matrix[pivotRow]] = [matrix[pivotRow], matrix[row]];

    const pivotValue = matrix[row][col];
    matrix[row] = matrix[row].map((v) => v.div(pivotValue));

    for (let r = 0; r < m; r++) {
      if (r === row) continue;
      const factor = matrix[r][col];
      if (factor.isZero()) continue;
      matrix[r] = matrix[r].map((v, c) => v.sub(factor.mul(matrix[row][c])));
    }

    pivotCols.push(col);
    row++;
  }

  return pivotCols;
}
