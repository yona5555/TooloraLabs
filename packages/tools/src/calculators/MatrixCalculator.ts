import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MatrixCalculatorInput = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  b11: number;
  b12: number;
  b21: number;
  b22: number;
};

export type MatrixCalculatorError = "singular-matrix-a";

export type MatrixCalculatorOutput = {
  error: MatrixCalculatorError | null;
  sum11: number;
  sum12: number;
  sum21: number;
  sum22: number;
  diff11: number;
  diff12: number;
  diff21: number;
  diff22: number;
  product11: number;
  product12: number;
  product21: number;
  product22: number;
  determinantA: number;
  determinantB: number;
  transposeA11: number;
  transposeA12: number;
  transposeA21: number;
  transposeA22: number;
  inverseA11: number | null;
  inverseA12: number | null;
  inverseA21: number | null;
  inverseA22: number | null;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Computes the standard set of 2x2 matrix operations on A and B: sum,
 * difference, matrix product (A x B), each matrix's determinant, A's
 * transpose, and A's inverse. The inverse is null (and a typed error
 * returned) when A is singular (determinant 0), since a 2x2 inverse divides
 * by the determinant.
 */
export class MatrixCalculator extends BaseCalculator<MatrixCalculatorInput, MatrixCalculatorOutput> {
  metadata = {
    id: "matrix-calculator",
    slug: "matrix-calculator",
    name: "Matrix Calculator",
    category: "math-science",
    description: "Compute the sum, difference, product, determinant, transpose, and inverse of two 2x2 matrices.",
    version: "1.0.0",
  };

  execute(input: MatrixCalculatorInput, _context: ToolContext): ToolResult<MatrixCalculatorOutput> {
    const { a11, a12, a21, a22, b11, b12, b21, b22 } = input;

    const sum11 = a11 + b11;
    const sum12 = a12 + b12;
    const sum21 = a21 + b21;
    const sum22 = a22 + b22;

    const diff11 = a11 - b11;
    const diff12 = a12 - b12;
    const diff21 = a21 - b21;
    const diff22 = a22 - b22;

    const product11 = a11 * b11 + a12 * b21;
    const product12 = a11 * b12 + a12 * b22;
    const product21 = a21 * b11 + a22 * b21;
    const product22 = a21 * b12 + a22 * b22;

    const determinantA = a11 * a22 - a12 * a21;
    const determinantB = b11 * b22 - b12 * b21;

    const transposeA11 = a11;
    const transposeA12 = a21;
    const transposeA21 = a12;
    const transposeA22 = a22;

    let error: MatrixCalculatorError | null = null;
    let inverseA11: number | null = null;
    let inverseA12: number | null = null;
    let inverseA21: number | null = null;
    let inverseA22: number | null = null;

    if (determinantA === 0) {
      error = "singular-matrix-a";
    } else {
      inverseA11 = a22 / determinantA;
      inverseA12 = -a12 / determinantA;
      inverseA21 = -a21 / determinantA;
      inverseA22 = a11 / determinantA;
    }

    return this.ok({
      error,
      sum11,
      sum12,
      sum21,
      sum22,
      diff11,
      diff12,
      diff21,
      diff22,
      product11,
      product12,
      product21,
      product22,
      determinantA,
      determinantB,
      transposeA11,
      transposeA12,
      transposeA21,
      transposeA22,
      inverseA11,
      inverseA12,
      inverseA21,
      inverseA22,
    });
  }

  private ok(data: MatrixCalculatorOutput): ToolResult<MatrixCalculatorOutput> {
    const c = (v: number | null) => (v === null ? null : clean(v));
    return {
      success: true,
      data: {
        error: data.error,
        sum11: clean(data.sum11),
        sum12: clean(data.sum12),
        sum21: clean(data.sum21),
        sum22: clean(data.sum22),
        diff11: clean(data.diff11),
        diff12: clean(data.diff12),
        diff21: clean(data.diff21),
        diff22: clean(data.diff22),
        product11: clean(data.product11),
        product12: clean(data.product12),
        product21: clean(data.product21),
        product22: clean(data.product22),
        determinantA: clean(data.determinantA),
        determinantB: clean(data.determinantB),
        transposeA11: clean(data.transposeA11),
        transposeA12: clean(data.transposeA12),
        transposeA21: clean(data.transposeA21),
        transposeA22: clean(data.transposeA22),
        inverseA11: c(data.inverseA11),
        inverseA12: c(data.inverseA12),
        inverseA21: c(data.inverseA21),
        inverseA22: c(data.inverseA22),
      },
      metadata: {},
    };
  }
}
