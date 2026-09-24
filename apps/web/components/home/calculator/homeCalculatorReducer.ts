import type { AngleMode, ScientificOperation } from "@tooloralabs/tools";
import { evaluateExpression, type EngineError } from "@/lib/home-calculator/expressionEngine";
import { formatCalculatorNumber } from "@/lib/home-calculator/formatNumber";

export type HistoryEntry = { id: number; expression: string; result: number };

export type CalculatorState = {
  expression: string;
  display: string;
  memory: number;
  ans: number | null;
  angleMode: AngleMode;
  errorCode: EngineError | null;
  history: HistoryEntry[];
  historySeq: number;
  /**
   * True immediately after "=" succeeds, until the next action. A digit,
   * decimal point, "(", function, constant, memory recall, or history load
   * pressed while this is true starts a brand-new expression instead of
   * appending to the just-computed result (e.g. "110" then "5" -> "5", not
   * "1105") — the same reset freshKeepingMemory already does for errorCode.
   * An operator/logBase/postfix press instead continues chaining from the
   * result ("110" then "+" -> "110+"), and must explicitly clear this flag
   * itself so the digit typed *after* the operator doesn't also get wiped.
   */
  justEvaluated: boolean;
};

const HISTORY_LIMIT = 30;

export const initialCalculatorState: CalculatorState = {
  expression: "",
  display: "0",
  memory: 0,
  ans: null,
  angleMode: "deg",
  errorCode: null,
  history: [],
  historySeq: 0,
  justEvaluated: false,
};

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; symbol: "+" | "-" | "×" | "÷" | "^" }
  | { type: "logBase" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "function"; token: string; requiresArg?: boolean }
  | { type: "postfix"; symbol: "!" | "%" | "²" | "³" }
  | { type: "constant"; symbol: "π" | "e" }
  | { type: "ans" }
  | { type: "equals" }
  | { type: "clearEntry" }
  | { type: "clearAll" }
  | { type: "backspace" }
  | { type: "toggleSign" }
  | { type: "toggleAngleMode" }
  | { type: "memoryAdd" }
  | { type: "memorySubtract" }
  | { type: "memoryRecall" }
  | { type: "memoryClear" }
  | { type: "loadHistory"; entry: HistoryEntry };

const OPEN_TOKENS = new Set(["(", "sin(", "cos(", "tan(", "cot(", "sec(", "csc(", "sin⁻¹(", "cos⁻¹(", "tan⁻¹(", "√(", "³√(", "ln(", "log(", "eˣ(", "10ˣ(", "2ˣ(", "abs("]);

function currentDisplayValue(state: CalculatorState): number {
  if (state.errorCode) return 0;
  const trimmed = state.expression.trim();
  if (!trimmed) return 0;
  const result = evaluateExpression(trimmed, state.angleMode);
  return result.success ? result.value : parseFloat(state.display) || 0;
}

/** The trailing "number being typed" segment — used for digit-append and the ± sign toggle, so we don't have to reparse the whole string on every keystroke. */
function trailingNumberStart(expr: string): number {
  let i = expr.length;
  while (i > 0 && /[0-9.]/.test(expr[i - 1])) i--;
  // Allow a leading minus that belongs to *this* number (not a binary operator) — i.e. only if
  // what precedes it is the start of the string, an open token, or another operator.
  if (i > 0 && expr[i - 1] === "-") {
    const before = expr.slice(0, i - 1);
    const endsWithOpenContext = before === "" || /[(+\-×÷^]$/.test(before) || [...OPEN_TOKENS].some((t) => before.endsWith(t));
    if (endsWithOpenContext) i--;
  }
  return i;
}

function pushHistory(state: CalculatorState, expression: string, result: number): Pick<CalculatorState, "history" | "historySeq"> {
  const entry: HistoryEntry = { id: state.historySeq, expression, result };
  return { history: [entry, ...state.history].slice(0, HISTORY_LIMIT), historySeq: state.historySeq + 1 };
}

function freshKeepingMemory(state: CalculatorState): CalculatorState {
  return { ...initialCalculatorState, memory: state.memory, angleMode: state.angleMode, ans: state.ans, history: state.history, historySeq: state.historySeq };
}

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "digit": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + action.digit, display: base.expression === "" || base.expression === "0" ? action.digit : base.display, justEvaluated: false };
    }

    case "decimal": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const start = trailingNumberStart(base.expression);
      const currentNumber = base.expression.slice(start);
      if (currentNumber.includes(".")) return { ...base, justEvaluated: false };
      const expr = currentNumber === "" ? `${base.expression}0.` : `${base.expression}.`;
      return { ...base, expression: expr, justEvaluated: false };
    }

    case "operator": {
      if (state.errorCode) return state;
      const map = { "+": "+", "-": "-", "×": "×", "÷": "÷", "^": "^" } as const;
      const symbol = map[action.symbol];
      // Replace a trailing operator instead of stacking two in a row.
      if (/[+\-×÷^]$/.test(state.expression)) {
        return { ...state, expression: state.expression.slice(0, -1) + symbol, justEvaluated: false };
      }
      const base = state.expression === "" ? (state.ans !== null ? String(state.ans) : "0") : state.expression;
      return { ...state, expression: base + symbol, justEvaluated: false };
    }

    case "logBase": {
      if (state.errorCode) return state;
      if (/[+\-×÷^]$/.test(state.expression)) return state;
      const base = state.expression === "" ? (state.ans !== null ? String(state.ans) : "0") : state.expression;
      return { ...state, expression: base + "logᵧ", justEvaluated: false };
    }

    case "lparen": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      return { ...base, expression: base.expression === "0" ? "(" : base.expression + "(", justEvaluated: false };
    }

    case "rparen": {
      if (state.errorCode) return state;
      const opens = (state.expression.match(/\(/g) ?? []).length;
      const closes = (state.expression.match(/\)/g) ?? []).length;
      if (opens <= closes) return state;
      return { ...state, expression: state.expression + ")", justEvaluated: false };
    }

    case "function": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + action.token, justEvaluated: false };
    }

    case "postfix": {
      if (state.errorCode || state.expression === "") return state;
      return { ...state, expression: state.expression + action.symbol, justEvaluated: false };
    }

    case "constant": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + action.symbol, justEvaluated: false };
    }

    case "ans": {
      if (state.ans === null) return state;
      const base = state.errorCode ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + String(base.ans), justEvaluated: false };
    }

    case "equals": {
      if (state.errorCode) return state;
      const trimmed = state.expression.trim();
      if (!trimmed) return state;
      const result = evaluateExpression(trimmed, state.angleMode);
      if (!result.success) {
        return { ...freshKeepingMemory(state), display: "Error", errorCode: result.error, expression: "" };
      }
      const displayExpr = `${trimmed} =`;
      return {
        ...state,
        expression: String(result.value),
        display: formatCalculatorNumber(result.value),
        ans: result.value,
        justEvaluated: true,
        ...pushHistory(state, displayExpr, result.value),
      };
    }

    case "clearEntry":
      return { ...state, expression: "", display: "0", errorCode: null, justEvaluated: false };

    case "clearAll":
      return freshKeepingMemory(state);

    case "backspace": {
      if (state.errorCode) return freshKeepingMemory(state);
      if (state.expression.length === 0) return state;
      // Function tokens end in "(" and are multi-character — remove the whole token at once
      // rather than leaving a dangling "(" with no name, which would desync the paren count.
      const openToken = [...OPEN_TOKENS].find((t) => t !== "(" && state.expression.endsWith(t));
      const next = openToken ? state.expression.slice(0, -openToken.length) : state.expression.slice(0, -1);
      return { ...state, expression: next, justEvaluated: false };
    }

    case "toggleSign": {
      if (state.errorCode || state.expression === "") return state;
      const start = trailingNumberStart(state.expression);
      const before = state.expression.slice(0, start);
      const numberPart = state.expression.slice(start);
      if (numberPart.startsWith("-")) {
        return { ...state, expression: before + numberPart.slice(1), justEvaluated: false };
      }
      return { ...state, expression: before + "-" + numberPart, justEvaluated: false };
    }

    case "toggleAngleMode":
      return { ...state, angleMode: state.angleMode === "deg" ? "rad" : "deg" };

    case "memoryAdd":
      return { ...state, memory: state.memory + currentDisplayValue(state) };

    case "memorySubtract":
      return { ...state, memory: state.memory - currentDisplayValue(state) };

    case "memoryRecall": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + String(base.memory), justEvaluated: false };
    }

    case "memoryClear":
      return { ...state, memory: 0 };

    case "loadHistory": {
      const base = state.errorCode || state.justEvaluated ? freshKeepingMemory(state) : state;
      const expr = base.expression === "0" ? "" : base.expression;
      return { ...base, expression: expr + String(action.entry.result), ans: action.entry.result, justEvaluated: false };
    }

    default:
      return state;
  }
}

export function functionToken(operation: ScientificOperation, label: string): string {
  return `${label}(`;
}
