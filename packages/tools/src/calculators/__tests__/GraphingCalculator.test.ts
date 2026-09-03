import { describe, expect, it } from "vitest";
import { GraphingCalculator, parseExpression, evaluateExpression, ExpressionParseError, ExpressionEvalError } from "../GraphingCalculator";

const tool = new GraphingCalculator();

describe("expression engine", () => {
  it("evaluates basic arithmetic with correct precedence", () => {
    const ast = parseExpression("2 + 3 * 4");
    expect(evaluateExpression(ast, {})).toBe(14);
  });

  it("evaluates exponentiation as right-associative", () => {
    const ast = parseExpression("2 ^ 3 ^ 2");
    expect(evaluateExpression(ast, {})).toBe(512); // 2^(3^2) = 2^9
  });

  it("evaluates unary minus", () => {
    const ast = parseExpression("-2 ^ 2");
    expect(evaluateExpression(ast, {})).toBe(-4); // unary binds looser than ^, so -(2^2)
  });

  it("evaluates parentheses", () => {
    const ast = parseExpression("(2 + 3) * 4");
    expect(evaluateExpression(ast, {})).toBe(20);
  });

  it("evaluates a variable from scope", () => {
    const ast = parseExpression("x * 2 + 1");
    expect(evaluateExpression(ast, { x: 5 })).toBe(11);
  });

  it("evaluates function calls", () => {
    const ast = parseExpression("sqrt(16)");
    expect(evaluateExpression(ast, {})).toBe(4);
  });

  it("evaluates known constants", () => {
    const ast = parseExpression("pi");
    expect(evaluateExpression(ast, {})).toBeCloseTo(Math.PI, 10);
  });

  it("throws a parse error for invalid syntax", () => {
    expect(() => parseExpression("2 + * 3")).toThrow(ExpressionParseError);
  });

  it("throws an eval error for an unknown variable", () => {
    const ast = parseExpression("y + 1");
    expect(() => evaluateExpression(ast, {})).toThrow(ExpressionEvalError);
  });
});

describe("GraphingCalculator", () => {
  it("samples a linear function correctly", () => {
    const result = tool.execute({ expression: "x", xMin: 0, xMax: 4, samples: 5 }, { locale: "en-US" }).data;
    expect(result.error).toBeNull();
    expect(result.points).toHaveLength(5);
    expect(result.points.map((p) => p.y)).toEqual([0, 1, 2, 3, 4]);
    expect(result.yMin).toBe(0);
    expect(result.yMax).toBe(4);
  });

  it("samples a quadratic function", () => {
    const result = tool.execute({ expression: "x^2", xMin: -2, xMax: 2, samples: 5 }, { locale: "en-US" }).data;
    expect(result.points.map((p) => p.y)).toEqual([4, 1, 0, 1, 4]);
  });

  it("marks points as null where the function is undefined", () => {
    const result = tool.execute({ expression: "1 / x", xMin: -1, xMax: 1, samples: 3 }, { locale: "en-US" }).data;
    // middle sample is x=0 -> division by zero -> Infinity -> filtered to null
    expect(result.points[1].y).toBeNull();
  });

  it("flags an invalid range", () => {
    const result = tool.execute({ expression: "x", xMin: 5, xMax: 1 }, { locale: "en-US" }).data;
    expect(result.error).toBe("invalid-range");
  });

  it("flags an invalid expression", () => {
    const result = tool.execute({ expression: "x +", xMin: 0, xMax: 1 }, { locale: "en-US" }).data;
    expect(result.error).toBe("invalid-expression");
  });
});
