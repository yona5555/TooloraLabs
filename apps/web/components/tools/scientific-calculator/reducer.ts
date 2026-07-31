import {
  ScientificCalculator,
  type AngleMode,
  type ScientificOperation,
} from "@tooloralabs/tools";
import { formatResult } from "./formatResult";

const tool = new ScientificCalculator();

export type BinaryOperator = "add" | "subtract" | "multiply" | "divide" | "power" | "root";

export type CalculatorState = {
  display: string;
  previousValue: number | null;
  pendingOperator: BinaryOperator | null;
  overwrite: boolean;
  memory: number;
  ans: number | null;
  lastOperationText: string;
  angleMode: AngleMode;
  errorCode: string | null;
};

export const initialState: CalculatorState = {
  display: "0",
  previousValue: null,
  pendingOperator: null,
  overwrite: true,
  memory: 0,
  ans: null,
  lastOperationText: "",
  angleMode: "deg",
  errorCode: null,
};

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "exp" }
  | { type: "expSign" }
  | { type: "operator"; operator: BinaryOperator; symbol: string }
  | { type: "equals" }
  | { type: "unary"; operation: ScientificOperation; label: string }
  | { type: "constant"; value: number }
  | { type: "clearAll" }
  | { type: "backspace" }
  | { type: "toggleAngleMode" }
  | { type: "memoryAdd" }
  | { type: "memorySubtract" }
  | { type: "memoryRecall" }
  | { type: "ans" };

function currentValue(state: CalculatorState): number {
  return parseFloat(state.display) || 0;
}

function freshInput(state: CalculatorState): CalculatorState {
  return { ...initialState, memory: state.memory, angleMode: state.angleMode };
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case "digit": {
      const base = state.errorCode ? freshInput(state) : state;
      if (base.overwrite) {
        return { ...base, display: action.digit, overwrite: false };
      }
      if (base.display.replace(/[-.]/g, "").length >= 15) {
        return base;
      }
      const display = base.display === "0" ? action.digit : base.display + action.digit;
      return { ...base, display };
    }

    case "decimal": {
      const base = state.errorCode ? freshInput(state) : state;
      if (base.overwrite) {
        return { ...base, display: "0.", overwrite: false };
      }
      if (base.display.includes(".")) return base;
      return { ...base, display: base.display + "." };
    }

    case "exp": {
      if (state.errorCode || state.display.toLowerCase().includes("e")) return state;
      return { ...state, display: state.display + "e", overwrite: false };
    }

    case "expSign":
      return { ...state, display: state.display + "-" };

    case "operator": {
      if (state.errorCode) return state;
      const value = currentValue(state);

      if (state.pendingOperator !== null && !state.overwrite) {
        const result = tool.execute(
          {
            operation: state.pendingOperator,
            a: state.previousValue ?? 0,
            b: value,
            angleMode: state.angleMode,
          },
          { locale: "en-US" }
        );
        if (!result.success) {
          return {
            ...freshInput(state),
            display: "Error",
            errorCode: String(result.metadata.error),
          };
        }
        return {
          ...state,
          display: formatResult(result.data.result),
          previousValue: result.data.result,
          pendingOperator: action.operator,
          overwrite: true,
          lastOperationText: `${formatResult(result.data.result)} ${action.symbol}`,
        };
      }

      return {
        ...state,
        previousValue: value,
        pendingOperator: action.operator,
        overwrite: true,
        lastOperationText: `${formatResult(value)} ${action.symbol}`,
      };
    }

    case "equals": {
      if (state.errorCode || state.pendingOperator === null || state.previousValue === null) {
        return state;
      }
      const b = currentValue(state);
      const result = tool.execute(
        { operation: state.pendingOperator, a: state.previousValue, b, angleMode: state.angleMode },
        { locale: "en-US" }
      );
      if (!result.success) {
        return {
          ...freshInput(state),
          display: "Error",
          errorCode: String(result.metadata.error),
        };
      }
      return {
        ...state,
        display: formatResult(result.data.result),
        ans: result.data.result,
        previousValue: null,
        pendingOperator: null,
        overwrite: true,
        lastOperationText: `${formatResult(state.previousValue)} ${formatResult(b)} =`,
      };
    }

    case "unary": {
      if (state.errorCode) return state;
      const value = currentValue(state);
      const result = tool.execute(
        { operation: action.operation, a: value, angleMode: state.angleMode },
        { locale: "en-US" }
      );
      if (!result.success) {
        return {
          ...freshInput(state),
          display: "Error",
          errorCode: String(result.metadata.error),
        };
      }
      return {
        ...state,
        display: formatResult(result.data.result),
        ans: result.data.result,
        overwrite: true,
        lastOperationText: `${action.label}(${formatResult(value)})`,
      };
    }

    case "constant":
      return { ...state, display: formatResult(action.value), overwrite: true, errorCode: null };

    case "clearAll":
      return freshInput(state);

    case "backspace": {
      if (state.errorCode) return freshInput(state);
      if (state.overwrite) return state;
      const next = state.display.length > 1 ? state.display.slice(0, -1) : "0";
      return { ...state, display: next === "-" ? "0" : next, overwrite: next === "0" };
    }

    case "toggleAngleMode":
      return { ...state, angleMode: state.angleMode === "deg" ? "rad" : "deg" };

    case "memoryAdd":
      return { ...state, memory: state.memory + currentValue(state), overwrite: true };

    case "memorySubtract":
      return { ...state, memory: state.memory - currentValue(state), overwrite: true };

    case "memoryRecall":
      return { ...state, display: formatResult(state.memory), overwrite: true, errorCode: null };

    case "ans":
      if (state.ans === null) return state;
      return { ...state, display: formatResult(state.ans), overwrite: true, errorCode: null };

    default:
      return state;
  }
}
