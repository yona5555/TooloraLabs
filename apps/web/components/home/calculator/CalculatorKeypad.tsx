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

/**
 * Every variant gets a "raised keycap" bevel via a solid bottom-edge shadow
 * (not a blurred drop shadow, which would look like it floats rather than
 * has depth) that collapses to flat + a 1px downward shift on :active, so
 * pressing a key actually looks pressed. Operators/equals/delete use solid,
 * saturated fills (not pale tinted-white backgrounds) so they read as
 * distinctly "different kinds of buttons" at a glance, and every dark-mode
 * text color is pushed to near-white rather than mid-gray so it never washes
 * out against these still-fairly-dark button fills.
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  number:
    "border border-zinc-300 bg-white text-zinc-900 shadow-[0_2px_0_rgba(0,0,0,0.10)] hover:bg-zinc-50 active:translate-y-px active:shadow-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:shadow-[0_2px_0_rgba(0,0,0,0.5)] dark:hover:bg-zinc-600",
  operator:
    "bg-blue-500 text-white shadow-[0_3px_0_rgba(29,78,216,0.9)] hover:bg-blue-400 active:translate-y-px active:shadow-[0_1px_0_rgba(29,78,216,0.9)] dark:bg-blue-500 dark:shadow-[0_3px_0_rgba(30,58,138,1)] dark:hover:bg-blue-400",
  function:
    "border border-zinc-200 bg-zinc-100 text-zinc-800 shadow-[0_2px_0_rgba(0,0,0,0.06)] hover:bg-zinc-200 active:translate-y-px active:shadow-none dark:border-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-50 dark:shadow-[0_2px_0_rgba(0,0,0,0.4)] dark:hover:bg-zinc-600",
  clear:
    "bg-amber-500 text-white shadow-[0_3px_0_rgba(180,83,9,0.9)] hover:bg-amber-400 active:translate-y-px active:shadow-[0_1px_0_rgba(180,83,9,0.9)] dark:bg-amber-500 dark:shadow-[0_3px_0_rgba(120,53,15,1)] dark:hover:bg-amber-400",
  delete:
    "bg-red-500 text-white shadow-[0_3px_0_rgba(185,28,28,0.9)] hover:bg-red-400 active:translate-y-px active:shadow-[0_1px_0_rgba(185,28,28,0.9)] dark:bg-red-500 dark:shadow-[0_3px_0_rgba(127,29,29,1)] dark:hover:bg-red-400",
  equals:
    "bg-blue-600 text-white shadow-[0_3px_0_rgba(30,58,138,0.9)] hover:bg-blue-500 active:translate-y-px active:shadow-[0_1px_0_rgba(30,58,138,0.9)] dark:bg-blue-600 dark:shadow-[0_3px_0_rgba(23,37,84,1)] dark:hover:bg-blue-500",
  toggle:
    "border border-zinc-200 bg-zinc-100 text-zinc-800 shadow-[0_2px_0_rgba(0,0,0,0.06)] hover:bg-zinc-200 active:translate-y-px active:shadow-none dark:border-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-50 dark:shadow-[0_2px_0_rgba(0,0,0,0.4)] dark:hover:bg-zinc-600",
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
