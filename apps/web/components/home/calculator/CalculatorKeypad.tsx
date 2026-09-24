"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Delete } from "lucide-react";
import type { ScientificOperation } from "@tooloralabs/tools";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { functionToken, type CalculatorAction, type CalculatorState } from "./homeCalculatorReducer";

type CalculatorKeypadProps = {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
};

type Variant = "number" | "operator" | "function" | "clear" | "delete" | "equals" | "toggle";

type ButtonSpec = {
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  variant: Variant;
  active?: boolean;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  number:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  operator:
    "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20",
  function:
    "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700",
  clear: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20",
  delete:
    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
  equals: "bg-blue-600 text-white hover:bg-blue-700",
  toggle:
    "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700",
};

const TRIG_INVERSE: Record<string, { label: string; op: ScientificOperation }> = {
  sin: { label: "sin⁻¹", op: "asin" },
  cos: { label: "cos⁻¹", op: "acos" },
  tan: { label: "tan⁻¹", op: "atan" },
};

export default function CalculatorKeypad({ state, dispatch }: CalculatorKeypadProps) {
  const tHome = useTranslations("homeCalculator");
  const [secondMode, setSecondMode] = useState(false);

  function digit(d: string) {
    dispatch({ type: "digit", digit: d });
  }
  function operator(symbol: "+" | "-" | "×" | "÷" | "^") {
    dispatch({ type: "operator", symbol });
  }
  function fn(op: ScientificOperation, label: string) {
    dispatch({ type: "function", token: functionToken(op, label) });
  }
  function postfix(symbol: "!" | "%" | "²" | "³") {
    dispatch({ type: "postfix", symbol });
  }

  function trigButton(base: "sin" | "cos" | "tan"): ButtonSpec {
    if (secondMode) {
      const inv = TRIG_INVERSE[base];
      return { label: inv.label, onClick: () => fn(inv.op, inv.label), variant: "function" };
    }
    return { label: base, onClick: () => fn(base as ScientificOperation, base), variant: "function" };
  }

  const rows: (ButtonSpec | null)[][] = [
    [
      {
        label: "2nd",
        onClick: () => setSecondMode((v) => !v),
        variant: "toggle",
        active: secondMode,
        ariaLabel: tHome("buttons.secondFunction"),
      },
      { label: "mr", onClick: () => dispatch({ type: "memoryRecall" }), variant: "function", ariaLabel: tHome("buttons.memoryRecall") },
      { label: "m+", onClick: () => dispatch({ type: "memoryAdd" }), variant: "function", ariaLabel: tHome("buttons.memoryAdd") },
      { label: "mc", onClick: () => dispatch({ type: "memoryClear" }), variant: "function", ariaLabel: tHome("buttons.memoryClear") },
      { label: "e", onClick: () => dispatch({ type: "constant", symbol: "e" }), variant: "function" },
      { label: "CE", onClick: () => dispatch({ type: "clearEntry" }), variant: "clear", ariaLabel: tHome("buttons.clearEntry") },
      { label: "C", onClick: () => dispatch({ type: "clearAll" }), variant: "clear", ariaLabel: tHome("buttons.clearAll") },
      { label: "⌫", onClick: () => dispatch({ type: "backspace" }), variant: "delete", ariaLabel: tHome("buttons.backspace") },
    ],
    [
      trigButton("sin"),
      trigButton("cos"),
      trigButton("tan"),
      { label: "cot", onClick: () => fn("cot", "cot"), variant: "function" },
      { label: "(", onClick: () => dispatch({ type: "lparen" }), variant: "function" },
      { label: ")", onClick: () => dispatch({ type: "rparen" }), variant: "function" },
      { label: "%", onClick: () => postfix("%"), variant: "function" },
      { label: "÷", onClick: () => operator("÷"), variant: "operator" },
    ],
    [
      { label: "sec", onClick: () => fn("sec", "sec"), variant: "function" },
      { label: "csc", onClick: () => fn("csc", "csc"), variant: "function" },
      { label: "7", onClick: () => digit("7"), variant: "number" },
      { label: "8", onClick: () => digit("8"), variant: "number" },
      { label: "9", onClick: () => digit("9"), variant: "number" },
      { label: "×", onClick: () => operator("×"), variant: "operator" },
      null,
      null,
    ],
    [
      { label: "x²", onClick: () => postfix("²"), variant: "function" },
      { label: "x³", onClick: () => postfix("³"), variant: "function" },
      { label: "xʸ", onClick: () => operator("^"), variant: "function" },
      { label: "eˣ", onClick: () => fn("exp", "eˣ"), variant: "function" },
      { label: "4", onClick: () => digit("4"), variant: "number" },
      { label: "5", onClick: () => digit("5"), variant: "number" },
      { label: "6", onClick: () => digit("6"), variant: "number" },
      { label: "−", onClick: () => operator("-"), variant: "operator" },
    ],
    [
      { label: "10ˣ", onClick: () => fn("pow10", "10ˣ"), variant: "function" },
      { label: "ln", onClick: () => fn("ln", "ln"), variant: "function" },
      { label: "2ˣ", onClick: () => fn("twoPow", "2ˣ"), variant: "function" },
      { label: "|x|", onClick: () => fn("abs", "abs"), variant: "function" },
      { label: "1", onClick: () => digit("1"), variant: "number" },
      { label: "2", onClick: () => digit("2"), variant: "number" },
      { label: "3", onClick: () => digit("3"), variant: "number" },
      { label: "+", onClick: () => operator("+"), variant: "operator" },
    ],
    [
      {
        label: state.angleMode === "deg" ? "Deg" : "Rad",
        onClick: () => dispatch({ type: "toggleAngleMode" }),
        variant: "toggle",
        ariaLabel: tHome("buttons.angleMode"),
      },
      { label: "logₓ", onClick: () => fn("log10", "log"), variant: "function" },
      { label: "log_y x", onClick: () => dispatch({ type: "logBase" }), variant: "function", ariaLabel: tHome("buttons.logBase") },
      { label: "x!", onClick: () => postfix("!"), variant: "function" },
      { label: "±", onClick: () => dispatch({ type: "toggleSign" }), variant: "function", ariaLabel: tHome("buttons.plusMinus") },
      { label: "0", onClick: () => digit("0"), variant: "number" },
      { label: ".", onClick: () => dispatch({ type: "decimal" }), variant: "number" },
      { label: "=", onClick: () => dispatch({ type: "equals" }), variant: "equals", ariaLabel: tHome("buttons.equals") },
    ],
  ];

  return (
    <div className="grid grid-cols-8 gap-1 p-2 sm:gap-1.5 sm:p-3" dir="ltr">
      {rows.flat().map((button, index) =>
        button === null ? (
          <div key={index} aria-hidden="true" />
        ) : (
          <button
            key={index}
            type="button"
            onClick={button.onClick}
            aria-label={button.ariaLabel}
            aria-pressed={button.active}
            className={`flex h-9 items-center justify-center overflow-hidden rounded-lg px-1 font-semibold transition sm:h-11 ${VARIANT_CLASSES[button.variant]} ${
              button.active ? "ring-2 ring-blue-400" : ""
            }`}
          >
            {button.label === "⌫" ? (
              <Delete size={16} />
            ) : (
              <AutoFitText
                text={button.label}
                dir="ltr"
                allowWrap={false}
                className="font-semibold"
                steps={["text-sm", "text-xs", "text-[10px]", "text-[9px]"]}
              />
            )}
          </button>
        )
      )}
    </div>
  );
}
