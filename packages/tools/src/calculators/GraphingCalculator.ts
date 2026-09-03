import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export class ExpressionParseError extends Error {}
export class ExpressionEvalError extends Error {}

type ExprNode =
  | { type: "num"; value: number }
  | { type: "var"; name: string }
  | { type: "call"; name: string; args: ExprNode[] }
  | { type: "unary"; arg: ExprNode }
  | { type: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: ExprNode; right: ExprNode };

type Token = { type: "num" | "ident" | "op" | "lparen" | "rparen" | "comma"; value: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9.]/.test(source[j])) j++;
      tokens.push({ type: "num", value: source.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < source.length && /[a-zA-Z0-9_]/.test(source[j])) j++;
      tokens.push({ type: "ident", value: source.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma", value: ch });
      i++;
      continue;
    }
    throw new ExpressionParseError(`Unexpected character "${ch}" in expression.`);
  }
  return tokens;
}

/**
 * Recursive-descent parser for a small arithmetic expression grammar:
 * expression -> term (('+'|'-') term)*
 * term       -> power (('*'|'/') power)*
 * power      -> unary ('^' unary)?           (right-associative)
 * unary      -> '-' unary | primary
 * primary    -> number | identifier | identifier '(' args ')' | '(' expression ')'
 */
class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): ExprNode {
    const node = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new ExpressionParseError(`Unexpected token "${this.tokens[this.pos].value}".`);
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private parseExpression(): ExprNode {
    let node = this.parseTerm();
    while (this.peek()?.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.tokens[this.pos++].value as "+" | "-";
      node = { type: "binary", op, left: node, right: this.parseTerm() };
    }
    return node;
  }

  private parseTerm(): ExprNode {
    let node = this.parseFactor();
    while (this.peek()?.type === "op" && (this.peek()!.value === "*" || this.peek()!.value === "/")) {
      const op = this.tokens[this.pos++].value as "*" | "/";
      node = { type: "binary", op, left: node, right: this.parseFactor() };
    }
    return node;
  }

  // Unary minus binds looser than '^' (so "-2^2" parses as -(2^2)), but tighter
  // than '*'/'/', matching standard calculator convention.
  private parseFactor(): ExprNode {
    if (this.peek()?.type === "op" && this.peek()!.value === "-") {
      this.pos++;
      return { type: "unary", arg: this.parseFactor() };
    }
    return this.parsePower();
  }

  private parsePower(): ExprNode {
    const base = this.parsePrimary();
    if (this.peek()?.type === "op" && this.peek()!.value === "^") {
      this.pos++;
      return { type: "binary", op: "^", left: base, right: this.parseFactor() };
    }
    return base;
  }

  private parsePrimary(): ExprNode {
    const token = this.peek();
    if (!token) throw new ExpressionParseError("Unexpected end of expression.");

    if (token.type === "num") {
      this.pos++;
      return { type: "num", value: Number(token.value) };
    }
    if (token.type === "lparen") {
      this.pos++;
      const node = this.parseExpression();
      if (this.peek()?.type !== "rparen") throw new ExpressionParseError("Missing closing parenthesis.");
      this.pos++;
      return node;
    }
    if (token.type === "ident") {
      this.pos++;
      if (this.peek()?.type === "lparen") {
        this.pos++;
        const args: ExprNode[] = [];
        if (this.peek()?.type !== "rparen") {
          args.push(this.parseExpression());
          while (this.peek()?.type === "comma") {
            this.pos++;
            args.push(this.parseExpression());
          }
        }
        if (this.peek()?.type !== "rparen") throw new ExpressionParseError("Missing closing parenthesis.");
        this.pos++;
        return { type: "call", name: token.value.toLowerCase(), args };
      }
      return { type: "var", name: token.value.toLowerCase() };
    }
    throw new ExpressionParseError(`Unexpected token "${token.value}".`);
  }
}

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  max: Math.max,
  min: Math.min,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export function parseExpression(source: string): ExprNode {
  if (!source.trim()) throw new ExpressionParseError("Expression is empty.");
  return new Parser(tokenize(source)).parse();
}

export function evaluateExpression(node: ExprNode, scope: Record<string, number>): number {
  switch (node.type) {
    case "num":
      return node.value;
    case "var": {
      if (node.name in scope) return scope[node.name];
      if (node.name in CONSTANTS) return CONSTANTS[node.name];
      throw new ExpressionEvalError(`Unknown variable "${node.name}".`);
    }
    case "unary":
      return -evaluateExpression(node.arg, scope);
    case "call": {
      const fn = FUNCTIONS[node.name];
      if (!fn) throw new ExpressionEvalError(`Unknown function "${node.name}".`);
      return fn(...node.args.map((arg) => evaluateExpression(arg, scope)));
    }
    case "binary": {
      const left = evaluateExpression(node.left, scope);
      const right = evaluateExpression(node.right, scope);
      switch (node.op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return left ** right;
      }
    }
  }
}

export type GraphingCalculatorInput = {
  expression: string;
  xMin: number;
  xMax: number;
  samples?: number;
};

export type GraphingCalculatorError = "invalid-expression" | "invalid-range";

export type GraphPoint = { x: number; y: number | null };

export type GraphingCalculatorOutput = {
  error: GraphingCalculatorError | null;
  errorDetail: string | null;
  points: GraphPoint[];
  yMin: number | null;
  yMax: number | null;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Samples a single-variable function y = f(x) across a range so it can be
 * plotted. Parses the expression once via the shared recursive-descent
 * expression engine (also used by NotepadCalculator), then evaluates it at
 * evenly spaced x-values; points where evaluation fails or is non-finite
 * (division by zero, sqrt of a negative number, etc.) come back with
 * y: null so the caller can skip them when drawing the line.
 */
export class GraphingCalculator extends BaseCalculator<GraphingCalculatorInput, GraphingCalculatorOutput> {
  metadata = {
    id: "graphing-calculator",
    slug: "graphing-calculator",
    name: "Graphing Calculator",
    category: "math-science",
    description: "Plot the graph of a mathematical function over a chosen range of x-values.",
    version: "1.0.0",
  };

  execute(input: GraphingCalculatorInput, _context: ToolContext): ToolResult<GraphingCalculatorOutput> {
    const samples = input.samples ?? 300;
    if (!(input.xMax > input.xMin) || samples < 2 || samples > 2000) {
      return this.error("invalid-range", "The maximum x-value must be greater than the minimum, with a valid sample count.");
    }

    let ast: ExprNode;
    try {
      ast = parseExpression(input.expression);
    } catch (e) {
      return this.error("invalid-expression", e instanceof Error ? e.message : "Couldn't parse this expression.");
    }

    const step = (input.xMax - input.xMin) / (samples - 1);
    const points: GraphPoint[] = [];
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i < samples; i++) {
      const x = input.xMin + i * step;
      let y: number | null = null;
      try {
        const value = evaluateExpression(ast, { x });
        if (Number.isFinite(value)) {
          y = clean(value);
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      } catch {
        y = null;
      }
      points.push({ x: clean(x), y });
    }

    return {
      success: true,
      data: {
        error: null,
        errorDetail: null,
        points,
        yMin: Number.isFinite(yMin) ? yMin : null,
        yMax: Number.isFinite(yMax) ? yMax : null,
      },
      metadata: {},
    };
  }

  private error(error: GraphingCalculatorError, detail: string): ToolResult<GraphingCalculatorOutput> {
    return { success: true, data: { error, errorDetail: detail, points: [], yMin: null, yMax: null }, metadata: {} };
  }
}
