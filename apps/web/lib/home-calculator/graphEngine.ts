/**
 * A small, self-contained tokenizer + recursive-descent parser for plotting
 * a function of a single variable "x" — deliberately NOT sharing code with
 * expressionEngine.ts (the keypad's calculator engine), because that
 * engine's token set includes labels that contain a literal ASCII "x"
 * (e.g. "⅟x", "d/dx x²") which would conflict with treating a bare "x" as
 * a substitutable variable here. Graphing also always uses radians for
 * trig functions (the standard mathematical convention for a function
 * plot), independent of whatever angle mode the keypad calculator is in.
 */

const GRAPH_FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "var" }
  | { kind: "op"; op: "+" | "-" | "*" | "/" | "^" }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "func"; name: string };

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  const funcNames = Object.keys(GRAPH_FUNCTIONS).sort((a, b) => b.length - a.length);
  const constantNames = Object.keys(CONSTANTS).sort((a, b) => b.length - a.length);
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      i++;
      continue;
    }
    if ("+-*/^".includes(ch)) {
      tokens.push({ kind: "op", op: ch as "+" | "-" | "*" | "/" | "^" });
      i++;
      continue;
    }

    const funcMatch = funcNames.find((name) => expr.startsWith(name, i));
    if (funcMatch) {
      tokens.push({ kind: "func", name: funcMatch });
      i += funcMatch.length;
      continue;
    }
    const constMatch = constantNames.find((name) => expr.startsWith(name, i));
    if (constMatch) {
      tokens.push({ kind: "number", value: CONSTANTS[constMatch] });
      i += constMatch.length;
      continue;
    }
    if (ch === "x") {
      tokens.push({ kind: "var" });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const value = Number(expr.slice(i, j));
      if (!Number.isFinite(value)) return null;
      tokens.push({ kind: "number", value });
      i = j;
      continue;
    }

    return null;
  }

  return tokens;
}

class GraphParser {
  private tokens: Token[];
  private pos = 0;
  private x: number;
  failed = false;

  constructor(tokens: Token[], x: number) {
    this.tokens = tokens;
    this.x = x;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  parseExpression(): number {
    let value = this.parseTerm();
    while (true) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "+" || t.op === "-")) {
        this.pos++;
        const rhs = this.parseTerm();
        value = t.op === "+" ? value + rhs : value - rhs;
      } else {
        break;
      }
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parsePower();
    while (true) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "*" || t.op === "/")) {
        this.pos++;
        const rhs = this.parsePower();
        value = t.op === "*" ? value * rhs : value / rhs;
      } else if (t?.kind === "lparen" || t?.kind === "func" || t?.kind === "var" || (t?.kind === "number" && this.tokens[this.pos - 1]?.kind !== "op")) {
        // implicit multiplication: "2x", "2(x+1)", "2sin(x)"
        const rhs = this.parsePower();
        value = value * rhs;
      } else {
        break;
      }
    }
    return value;
  }

  private parsePower(): number {
    const base = this.parseUnary();
    const t = this.peek();
    if (t?.kind === "op" && t.op === "^") {
      this.pos++;
      const exponent = this.parsePower();
      return Math.pow(base, exponent);
    }
    return base;
  }

  private parseUnary(): number {
    const t = this.peek();
    if (t?.kind === "op" && t.op === "-") {
      this.pos++;
      return -this.parseUnary();
    }
    return this.parseAtom();
  }

  private parseAtom(): number {
    const t = this.peek();
    if (!t) {
      this.failed = true;
      return NaN;
    }
    if (t.kind === "number") {
      this.pos++;
      return t.value;
    }
    if (t.kind === "var") {
      this.pos++;
      return this.x;
    }
    if (t.kind === "lparen") {
      this.pos++;
      const value = this.parseExpression();
      if (this.peek()?.kind === "rparen") this.pos++;
      else this.failed = true;
      return value;
    }
    if (t.kind === "func") {
      this.pos++;
      if (this.peek()?.kind !== "lparen") {
        this.failed = true;
        return NaN;
      }
      this.pos++;
      const arg = this.parseExpression();
      if (this.peek()?.kind === "rparen") this.pos++;
      else this.failed = true;
      return GRAPH_FUNCTIONS[t.name](arg);
    }
    this.failed = true;
    return NaN;
  }
}

/**
 * Validates a formula once (parses it at a throwaway x=1) and, if valid,
 * returns a fast reusable evaluator — so plotting ~200 sample points only
 * re-tokenizes/re-parses once per point rather than needing to first prove
 * the formula is even well-formed on every single sample.
 */
export function compileGraphFormula(rawFormula: string): ((x: number) => number | null) | null {
  const cleaned = rawFormula
    .trim()
    .replace(/^y\s*=\s*/i, "")
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .toLowerCase();
  if (!cleaned) return null;

  const tokens = tokenize(cleaned);
  if (!tokens || tokens.length === 0) return null;

  // Validate once at a representative point before handing back the evaluator.
  const probe = new GraphParser(tokens, 1);
  probe.parseExpression();
  if (probe.failed) return null;

  return (x: number) => {
    const parser = new GraphParser(tokens, x);
    const value = parser.parseExpression();
    if (parser.failed || !Number.isFinite(value)) return null;
    return value;
  };
}
