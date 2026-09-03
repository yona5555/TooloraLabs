import { describe, expect, it } from "vitest";
import { StepByStepMathSolver, type StepByStepMathSolverInput } from "../StepByStepMathSolver";

const tool = new StepByStepMathSolver();
function run(input: StepByStepMathSolverInput) {
  return tool.execute(input, { locale: "en-US" }).data;
}

describe("StepByStepMathSolver - linear equations", () => {
  it("solves 3x + 5 = 2x + 9", () => {
    const result = run({ mode: "linear-equation", linearA: 3, linearB: 5, linearC: 2, linearD: 9 });
    expect(result.error).toBeNull();
    expect(result.result).toBe("x = 4");
    expect(result.steps.length).toBeGreaterThan(2);
  });

  it("flags an equation with no unique solution (parallel lines)", () => {
    const result = run({ mode: "linear-equation", linearA: 2, linearB: 3, linearC: 2, linearD: 7 });
    expect(result.error).toBe("no-unique-solution");
  });

  it("flags an identity (infinitely many solutions)", () => {
    const result = run({ mode: "linear-equation", linearA: 2, linearB: 3, linearC: 2, linearD: 3 });
    expect(result.error).toBe("no-unique-solution");
    expect(result.errorDetail).toMatch(/infinitely many/);
  });
});

describe("StepByStepMathSolver - quadratic equations", () => {
  it("solves x^2 - 5x + 6 = 0 (two real roots)", () => {
    const result = run({ mode: "quadratic-equation", quadA: 1, quadB: -5, quadC: 6 });
    expect(result.error).toBeNull();
    expect(result.result).toBe("x₁ = 3, x₂ = 2");
  });

  it("solves x^2 - 4x + 4 = 0 (repeated root)", () => {
    const result = run({ mode: "quadratic-equation", quadA: 1, quadB: -4, quadC: 4 });
    expect(result.result).toBe("x = 2");
  });

  it("solves x^2 + x + 1 = 0 (complex roots)", () => {
    const result = run({ mode: "quadratic-equation", quadA: 1, quadB: 1, quadC: 1 });
    expect(result.result).toMatch(/i$/);
  });

  it("rejects a=0", () => {
    const result = run({ mode: "quadratic-equation", quadA: 0, quadB: 1, quadC: 1 });
    expect(result.error).toBe("invalid-quadratic-equation");
  });
});

describe("StepByStepMathSolver - fraction operations", () => {
  it("adds two fractions", () => {
    const result = run({ mode: "fraction-operation", fracA: 1, fracB: 2, fracOp: "add", fracC: 1, fracD: 3 });
    expect(result.result).toBe("5/6");
  });

  it("subtracts two fractions", () => {
    const result = run({ mode: "fraction-operation", fracA: 3, fracB: 4, fracOp: "subtract", fracC: 1, fracD: 4 });
    expect(result.result).toBe("1/2");
  });

  it("multiplies two fractions", () => {
    const result = run({ mode: "fraction-operation", fracA: 2, fracB: 3, fracOp: "multiply", fracC: 3, fracD: 4 });
    expect(result.result).toBe("1/2");
  });

  it("divides two fractions", () => {
    const result = run({ mode: "fraction-operation", fracA: 1, fracB: 2, fracOp: "divide", fracC: 1, fracD: 4 });
    expect(result.result).toBe("2");
  });

  it("flags a zero denominator", () => {
    const result = run({ mode: "fraction-operation", fracA: 1, fracB: 0, fracOp: "add", fracC: 1, fracD: 2 });
    expect(result.error).toBe("invalid-fraction");
  });

  it("flags division by a zero-numerator fraction", () => {
    const result = run({ mode: "fraction-operation", fracA: 1, fracB: 2, fracOp: "divide", fracC: 0, fracD: 5 });
    expect(result.error).toBe("division-by-zero");
  });
});

describe("StepByStepMathSolver - derivatives", () => {
  it("differentiates a polynomial term by term", () => {
    const result = run({
      mode: "derivative",
      polynomialTerms: [
        { coefficient: 3, power: 2 },
        { coefficient: 2, power: 1 },
        { coefficient: 5, power: 0 },
      ],
    });
    expect(result.error).toBeNull();
    expect(result.result).toBe("f'(x) = 6x + 2");
  });

  it("flags an empty polynomial", () => {
    const result = run({ mode: "derivative", polynomialTerms: [] });
    expect(result.error).toBe("empty-polynomial");
  });
});
