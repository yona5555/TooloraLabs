import { ScientificCalculator, type AngleMode, type ScientificOperation } from "@tooloralabs/tools";

const tool = new ScientificCalculator();

/**
 * A genuine expression evaluator (tokenizer + recursive-descent parser),
 * not the single-pending-operator model the rest of the site's simpler
 * calculators use — this one needs to support real parentheses and mixed
 * operator precedence (e.g. "2+3×(4-1)^2"), which a two-operand state
 * machine structurally cannot represent. Every actual arithmetic/scientific
 * operation still routes through @tooloralabs/tools' ScientificCalculator
 * (domain errors, division-by-zero, angle-mode conversion all stay
 * centralized there) — this file only turns a flat expression string into
 * the sequence of calls to make and combines their results.
 */

export type EngineError =
  | "DIVISION_BY_ZERO"
  | "DOMAIN_ERROR"
  | "OUT_OF_RANGE"
  | "SYNTAX_ERROR";

export type EngineResult = { success: true; value: number } | { success: false; error: EngineError };

const FUNCTION_TOKENS: Record<string, ScientificOperation> = {
  sin: "sin",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  sec: "sec",
  csc: "csc",
  "sin⁻¹": "asin",
  "cos⁻¹": "acos",
  "tan⁻¹": "atan",
  "√": "sqrt",
  "³√": "cbrt",
  ln: "ln",
  log: "log10",
  "eˣ": "exp",
  "10ˣ": "pow10",
  "2ˣ": "twoPow",
  abs: "abs",
  "d/dx sin": "numDerivativeSin",
  "d/dx x²": "numDerivativeSquare",
  "∫x²": "numIntegralSquare",
  // "⅟x" (U+215F, not the ASCII digit "1") is deliberately used here instead
  // of the more obvious "1/x" — a digit-led token would get swallowed by the
  // tokenizer's number-matching branch when it immediately follows a typed
  // digit with no separator (e.g. "5" then this button would read as "51/x("
  // and misparse as the number 51 followed by a dangling, unrecognized
  // "/x"). U+215F isn't in the digit charset, so it can never be absorbed
  // into a preceding number, while still rendering as a recognizable "1/x".
  "⅟x": "reciprocal",
};

const CONSTANT_TOKENS: Record<string, number> = {
  π: Math.PI,
  e: Math.E,
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "op"; op: "+" | "-" | "×" | "÷" | "^" | "logbase" | "nCr" | "nPr" }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "func"; op: ScientificOperation }
  | { kind: "postfix"; op: "factorial" | "percent" | "square" | "cube" };

/**
 * Splits the raw expression string into tokens. Function names, constants,
 * and postfix markers are all distinct substrings the UI itself inserted
 * (see homeCalculatorReducer.ts) — they never need to be *inferred* from
 * ambiguous text, only recognized.
 */
function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const funcNames = Object.keys(FUNCTION_TOKENS).sort((a, b) => b.length - a.length);

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
    if (ch === "+" || ch === "-" || ch === "×" || ch === "÷" || ch === "^") {
      tokens.push({ kind: "op", op: ch });
      i++;
      continue;
    }
    if (expr.startsWith("logᵧ", i)) {
      tokens.push({ kind: "op", op: "logbase" });
      i += "logᵧ".length;
      continue;
    }
    if (expr.startsWith("nCr", i)) {
      tokens.push({ kind: "op", op: "nCr" });
      i += "nCr".length;
      continue;
    }
    if (expr.startsWith("nPr", i)) {
      tokens.push({ kind: "op", op: "nPr" });
      i += "nPr".length;
      continue;
    }

    // Function/constant names are checked (longest-match-first) before the
    // bare "!"/"%"/"²"/"³" postfix checks below, because "³√(" (cube root)
    // starts with the same "³" character as the standalone cube-postfix
    // marker — without this ordering, the postfix check would steal the "³"
    // off the front of "³√(" before the full function name could ever match.
    const constantMatch = Object.keys(CONSTANT_TOKENS).find((sym) => expr.startsWith(sym, i));
    if (constantMatch) {
      tokens.push({ kind: "number", value: CONSTANT_TOKENS[constantMatch] });
      i += constantMatch.length;
      continue;
    }

    const funcMatch = funcNames.find((name) => expr.startsWith(name, i));
    if (funcMatch) {
      tokens.push({ kind: "func", op: FUNCTION_TOKENS[funcMatch] });
      i += funcMatch.length;
      continue;
    }

    if (ch === "!") {
      tokens.push({ kind: "postfix", op: "factorial" });
      i++;
      continue;
    }
    if (ch === "%") {
      tokens.push({ kind: "postfix", op: "percent" });
      i++;
      continue;
    }
    if (ch === "²") {
      tokens.push({ kind: "postfix", op: "square" });
      i++;
      continue;
    }
    if (ch === "³") {
      tokens.push({ kind: "postfix", op: "cube" });
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const numText = expr.slice(i, j);
      const value = Number(numText);
      if (!Number.isFinite(value)) return null;
      tokens.push({ kind: "number", value });
      i = j;
      continue;
    }

    return null; // unrecognized character
  }

  return tokens;
}

/** Auto-closes any unmatched "(" at evaluation time, so the user never has to remember to close every paren before pressing "=". */
function autoCloseParens(tokens: Token[]): Token[] {
  let depth = 0;
  for (const t of tokens) {
    if (t.kind === "lparen") depth++;
    if (t.kind === "rparen") depth--;
  }
  if (depth <= 0) return tokens;
  return [...tokens, ...Array.from({ length: depth }, () => ({ kind: "rparen" as const }))];
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private angleMode: AngleMode;
  private failed = false;

  constructor(tokens: Token[], angleMode: AngleMode) {
    this.tokens = tokens;
    this.angleMode = angleMode;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private call(operation: ScientificOperation, a: number, b?: number): number {
    if (this.failed) return NaN;
    const result = tool.execute({ operation, a, b, angleMode: this.angleMode }, { locale: "en-US" });
    if (!result.success) {
      this.failed = true;
      this.errorCode = result.metadata.error as EngineError;
      return NaN;
    }
    return result.data.result;
  }

  errorCode: EngineError | null = null;

  /** Entry point: + and − (lowest precedence), left-associative. */
  parseExpression(): number {
    let value = this.parseTerm();
    while (!this.failed) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "+" || t.op === "-")) {
        this.pos++;
        const rhs = this.parseTerm();
        value = this.call(t.op === "+" ? "add" : "subtract", value, rhs);
      } else {
        break;
      }
    }
    return value;
  }

  /** × and ÷, left-associative. */
  private parseTerm(): number {
    let value = this.parsePower();
    while (!this.failed) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "×" || t.op === "÷")) {
        this.pos++;
        const rhs = this.parsePower();
        value = this.call(t.op === "×" ? "multiply" : "divide", value, rhs);
      } else if (t?.kind === "lparen" || t?.kind === "func" || (t?.kind === "number" && this.tokens[this.pos - 1]?.kind !== "op")) {
        // Implicit multiplication: "2(3+4)" or "2π" with no explicit × pressed.
        const rhs = this.parsePower();
        value = this.call("multiply", value, rhs);
      } else {
        break;
      }
    }
    return value;
  }

  /** ^ and the custom log-base marker, right-associative for ^. */
  private parsePower(): number {
    const base = this.parseUnaryPrefix();
    if (this.failed) return base;
    const t = this.peek();
    if (t?.kind === "op" && t.op === "^") {
      this.pos++;
      const exponent = this.parsePower();
      return this.call("power", base, exponent);
    }
    if (t?.kind === "op" && t.op === "logbase") {
      this.pos++;
      const base2 = this.parsePower();
      return this.call("logBase", base, base2);
    }
    if (t?.kind === "op" && (t.op === "nCr" || t.op === "nPr")) {
      this.pos++;
      const r = this.parsePower();
      return this.call(t.op, base, r);
    }
    return base;
  }

  /** Unary minus prefix (e.g. the start of an expression, or right after an operator/open-paren). */
  private parseUnaryPrefix(): number {
    const t = this.peek();
    if (t?.kind === "op" && t.op === "-") {
      this.pos++;
      return -this.parseUnaryPrefix();
    }
    return this.parsePostfix();
  }

  /** Postfix ! and % apply to whatever atom/function-call/group came before them. */
  private parsePostfix(): number {
    let value = this.parseAtom();
    while (!this.failed) {
      const t = this.peek();
      if (t?.kind === "postfix") {
        this.pos++;
        value = this.call(t.op, value);
      } else {
        break;
      }
    }
    return value;
  }

  private parseAtom(): number {
    const t = this.peek();
    if (!t) {
      this.failed = true;
      this.errorCode = "SYNTAX_ERROR";
      return NaN;
    }
    if (t.kind === "number") {
      this.pos++;
      return t.value;
    }
    if (t.kind === "lparen") {
      this.pos++;
      const value = this.parseExpression();
      if (this.peek()?.kind === "rparen") this.pos++;
      return value;
    }
    if (t.kind === "func") {
      this.pos++;
      const argToken = this.peek();
      if (argToken?.kind === "lparen") {
        this.pos++;
        const arg = this.parseExpression();
        if (this.peek()?.kind === "rparen") this.pos++;
        return this.call(t.op, arg);
      }
      const arg = this.parseUnaryPrefix();
      return this.call(t.op, arg);
    }
    this.failed = true;
    this.errorCode = "SYNTAX_ERROR";
    return NaN;
  }
}

export function evaluateExpression(expr: string, angleMode: AngleMode): EngineResult {
  const trimmed = expr.trim();
  if (!trimmed) return { success: false, error: "SYNTAX_ERROR" };

  const tokens = tokenize(trimmed);
  if (!tokens || tokens.length === 0) return { success: false, error: "SYNTAX_ERROR" };

  const closed = autoCloseParens(tokens);
  const parser = new Parser(closed, angleMode);
  const value = parser.parseExpression();

  if (parser.errorCode) return { success: false, error: parser.errorCode };
  if (!Number.isFinite(value)) return { success: false, error: "OUT_OF_RANGE" };
  return { success: true, value };
}

export function evaluateUnary(operation: ScientificOperation, a: number, angleMode: AngleMode): EngineResult {
  const result = tool.execute({ operation, a, angleMode }, { locale: "en-US" });
  if (!result.success) return { success: false, error: result.metadata.error as EngineError };
  if (!Number.isFinite(result.data.result)) return { success: false, error: "OUT_OF_RANGE" };
  return { success: true, value: result.data.result };
}
