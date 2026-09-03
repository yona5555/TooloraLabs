import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MathSolverMode = "linear-equation" | "quadratic-equation" | "fraction-operation" | "derivative";
export type FractionOperator = "add" | "subtract" | "multiply" | "divide";
export type PolynomialTerm = { coefficient: number; power: number };

export type StepByStepMathSolverInput = {
  mode: MathSolverMode;
  linearA?: number;
  linearB?: number;
  linearC?: number;
  linearD?: number;
  quadA?: number;
  quadB?: number;
  quadC?: number;
  fracA?: number;
  fracB?: number;
  fracOp?: FractionOperator;
  fracC?: number;
  fracD?: number;
  polynomialTerms?: PolynomialTerm[];
};

export type MathSolverError =
  | "no-unique-solution"
  | "invalid-quadratic-equation"
  | "invalid-fraction"
  | "division-by-zero"
  | "empty-polynomial"
  | "missing-input";

export type StepByStepMathSolverOutput = {
  error: MathSolverError | null;
  errorDetail: string | null;
  steps: string[];
  result: string;
};

function fmt(n: number): string {
  const rounded = Math.round(n * 1e8) / 1e8;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function signed(n: number): string {
  return n < 0 ? `- ${fmt(Math.abs(n))}` : `+ ${fmt(n)}`;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function termStr(coefficient: number, power: number): string {
  const absCoeff = Math.abs(coefficient);
  const coeffStr = absCoeff === 1 && power !== 0 ? "" : fmt(absCoeff);
  const varStr = power === 0 ? "" : power === 1 ? "x" : `x^${power}`;
  return `${coeffStr}${varStr}` || fmt(absCoeff);
}

function polynomialToString(terms: PolynomialTerm[]): string {
  const sorted = [...terms].filter((t) => t.coefficient !== 0).sort((a, b) => b.power - a.power);
  if (sorted.length === 0) return "0";
  return sorted
    .map((t, i) => {
      const term = termStr(t.coefficient, t.power);
      if (i === 0) return t.coefficient < 0 ? `-${term}` : term;
      return t.coefficient < 0 ? `- ${term}` : `+ ${term}`;
    })
    .join(" ");
}

/**
 * Solves a small family of common algebra and calculus problems, showing
 * the intermediate reasoning as a list of human-readable steps rather than
 * just a final answer.
 */
export class StepByStepMathSolver extends BaseCalculator<StepByStepMathSolverInput, StepByStepMathSolverOutput> {
  metadata = {
    id: "step-by-step-math-solver",
    slug: "step-by-step-math-solver",
    name: "Step-by-Step Math Solver",
    category: "math-science",
    description: "Solve linear equations, quadratic equations, fraction operations, and polynomial derivatives with the full working shown step by step.",
    version: "1.0.0",
  };

  execute(input: StepByStepMathSolverInput, _context: ToolContext): ToolResult<StepByStepMathSolverOutput> {
    switch (input.mode) {
      case "linear-equation":
        return this.solveLinear(input);
      case "quadratic-equation":
        return this.solveQuadratic(input);
      case "fraction-operation":
        return this.solveFraction(input);
      case "derivative":
        return this.solveDerivative(input);
    }
  }

  private solveLinear(input: StepByStepMathSolverInput): ToolResult<StepByStepMathSolverOutput> {
    const { linearA: a, linearB: b, linearC: c, linearD: d } = input;
    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      return this.error("missing-input", "Enter all four coefficients.");
    }

    const steps: string[] = [];
    steps.push(`Start: ${fmt(a)}x ${signed(b)} = ${fmt(c)}x ${signed(d)}`);

    const xCoeff = a - c;
    const constant = d - b;
    steps.push(`Move the x-terms to the left and the constants to the right: (${fmt(a)} - ${fmt(c)})x = ${fmt(d)} - ${fmt(b)}`);
    steps.push(`Simplify: ${fmt(xCoeff)}x = ${fmt(constant)}`);

    if (xCoeff === 0) {
      if (constant === 0) {
        return this.error("no-unique-solution", "This equation is true for every value of x — there are infinitely many solutions.");
      }
      return this.error("no-unique-solution", "This equation has no solution — the two sides can never be equal.");
    }

    const x = constant / xCoeff;
    steps.push(`Divide both sides by ${fmt(xCoeff)}: x = ${fmt(constant)} / ${fmt(xCoeff)}`);
    steps.push(`x = ${fmt(x)}`);

    return this.ok(steps, `x = ${fmt(x)}`);
  }

  private solveQuadratic(input: StepByStepMathSolverInput): ToolResult<StepByStepMathSolverOutput> {
    const { quadA: a, quadB: b, quadC: c } = input;
    if (a === undefined || b === undefined || c === undefined) {
      return this.error("missing-input", "Enter all three coefficients.");
    }
    if (a === 0) {
      return this.error("invalid-quadratic-equation", "The coefficient 'a' can't be zero — this wouldn't be a quadratic equation.");
    }

    const steps: string[] = [];
    steps.push(`Start: ${fmt(a)}x^2 ${signed(b)}x ${signed(c)} = 0`);
    steps.push(`Identify a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}`);

    const discriminant = b * b - 4 * a * c;
    steps.push(`Compute the discriminant: D = b^2 - 4ac = ${fmt(b)}^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(discriminant)}`);

    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      steps.push(`D > 0, so there are two real solutions: x = (-b ± √D) / (2a) = (${fmt(-b)} ± √${fmt(discriminant)}) / ${fmt(2 * a)}`);
      steps.push(`x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}`);
      return this.ok(steps, `x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}`);
    }

    if (discriminant === 0) {
      const x = -b / (2 * a);
      steps.push(`D = 0, so there is exactly one repeated solution: x = -b / (2a) = ${fmt(-b)} / ${fmt(2 * a)}`);
      steps.push(`x = ${fmt(x)}`);
      return this.ok(steps, `x = ${fmt(x)}`);
    }

    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    steps.push(`D < 0, so there are two complex solutions: x = (-b ± √D) / (2a)`);
    steps.push(`x = ${fmt(realPart)} ± ${fmt(Math.abs(imagPart))}i`);
    return this.ok(steps, `x = ${fmt(realPart)} ± ${fmt(Math.abs(imagPart))}i`);
  }

  private solveFraction(input: StepByStepMathSolverInput): ToolResult<StepByStepMathSolverOutput> {
    const { fracA: a, fracB: b, fracOp: op, fracC: c, fracD: d } = input;
    if (a === undefined || b === undefined || op === undefined || c === undefined || d === undefined) {
      return this.error("missing-input", "Enter both fractions and choose an operation.");
    }
    if (b === 0 || d === 0) {
      return this.error("invalid-fraction", "A fraction's denominator can't be zero.");
    }

    const symbols: Record<FractionOperator, string> = { add: "+", subtract: "-", multiply: "×", divide: "÷" };
    const steps: string[] = [`Start: ${fmt(a)}/${fmt(b)} ${symbols[op]} ${fmt(c)}/${fmt(d)}`];

    let num: number;
    let den: number;

    if (op === "add" || op === "subtract") {
      den = b * d;
      const scaledA = a * d;
      const scaledC = c * b;
      num = op === "add" ? scaledA + scaledC : scaledA - scaledC;
      steps.push(`Find a common denominator (${fmt(b)} × ${fmt(d)} = ${fmt(den)}): ${fmt(scaledA)}/${fmt(den)} ${symbols[op]} ${fmt(scaledC)}/${fmt(den)}`);
      steps.push(`Combine the numerators: ${fmt(scaledA)} ${op === "add" ? "+" : "-"} ${fmt(scaledC)} = ${fmt(num)}`);
    } else if (op === "multiply") {
      num = a * c;
      den = b * d;
      steps.push(`Multiply numerators and denominators: (${fmt(a)} × ${fmt(c)}) / (${fmt(b)} × ${fmt(d)})`);
    } else {
      if (c === 0) {
        return this.error("division-by-zero", "Can't divide by a fraction whose numerator is zero.");
      }
      num = a * d;
      den = b * c;
      steps.push(`Multiply by the reciprocal of the second fraction: ${fmt(a)}/${fmt(b)} × ${fmt(d)}/${fmt(c)}`);
      steps.push(`= (${fmt(a)} × ${fmt(d)}) / (${fmt(b)} × ${fmt(c)})`);
    }

    if (den < 0) {
      num = -num;
      den = -den;
    }
    const divisor = gcd(num, den);
    const reducedNum = num / divisor;
    const reducedDen = den / divisor;

    steps.push(`= ${fmt(num)}/${fmt(den)}`);
    if (divisor > 1) {
      steps.push(`Reduce by the greatest common divisor (${fmt(divisor)}): ${fmt(reducedNum)}/${fmt(reducedDen)}`);
    }

    const resultStr = reducedDen === 1 ? fmt(reducedNum) : `${fmt(reducedNum)}/${fmt(reducedDen)}`;
    steps.push(`Result: ${resultStr}`);
    return this.ok(steps, resultStr);
  }

  private solveDerivative(input: StepByStepMathSolverInput): ToolResult<StepByStepMathSolverOutput> {
    const terms = (input.polynomialTerms ?? []).filter((t) => t.coefficient !== 0);
    if (terms.length === 0) {
      return this.error("empty-polynomial", "Enter at least one non-zero term.");
    }

    const steps: string[] = [`Start: f(x) = ${polynomialToString(terms)}`];
    const derivativeTerms: PolynomialTerm[] = [];

    for (const term of terms) {
      if (term.power === 0) {
        steps.push(`d/dx[${termStr(term.coefficient, 0)}] = 0 (the derivative of a constant is 0)`);
        continue;
      }
      const newCoeff = term.coefficient * term.power;
      const newPower = term.power - 1;
      steps.push(
        `d/dx[${termStr(term.coefficient, term.power)}] = ${fmt(term.coefficient)} · ${term.power} · x^${newPower} = ${termStr(newCoeff, newPower)}`
      );
      derivativeTerms.push({ coefficient: newCoeff, power: newPower });
    }

    const result = polynomialToString(derivativeTerms);
    steps.push(`f'(x) = ${result}`);
    return this.ok(steps, `f'(x) = ${result}`);
  }

  private ok(steps: string[], result: string): ToolResult<StepByStepMathSolverOutput> {
    return { success: true, data: { error: null, errorDetail: null, steps, result }, metadata: {} };
  }

  private error(error: MathSolverError, detail: string): ToolResult<StepByStepMathSolverOutput> {
    return { success: true, data: { error, errorDetail: detail, steps: [], result: "" }, metadata: {} };
  }
}
