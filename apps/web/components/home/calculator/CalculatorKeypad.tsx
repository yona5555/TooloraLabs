"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Delete } from "lucide-react";
import type { ScientificOperation } from "@tooloralabs/tools";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { functionToken, type CalculatorAction, type CalculatorState } from "./homeCalculatorReducer";
import { KEYPAD_VARIANT_CLASSES, type KeypadVariant } from "./keypadButtonStyles";

type CalculatorKeypadProps = {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
};

type Variant = KeypadVariant;

type ButtonSpec = {
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  variant: Variant;
  active?: boolean;
};

const VARIANT_CLASSES = KEYPAD_VARIANT_CLASSES;

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
      // π and ⅟x are placed BEFORE sec/csc (rather than after, where they
      // originally filled this row's 2 empty trailing slots) specifically so
      // 7/8/9 land in the same 3 columns as 4/5/6 (row below) and 1/2/3 (two
      // rows below) — matching the standard calculator convention where the
      // digit grid stacks in fixed columns with the operator column fixed on
      // the far end, rather than drifting per row based on how many
      // non-digit buttons happen to precede the digits in that row.
      { label: "π", onClick: () => dispatch({ type: "constant", symbol: "π" }), variant: "function" },
      { label: "⅟x", onClick: () => fn("reciprocal", "⅟x"), variant: "function" },
      { label: "sec", onClick: () => fn("sec", "sec"), variant: "function" },
      { label: "csc", onClick: () => fn("csc", "csc"), variant: "function" },
      { label: "7", onClick: () => digit("7"), variant: "number" },
      { label: "8", onClick: () => digit("8"), variant: "number" },
      { label: "9", onClick: () => digit("9"), variant: "number" },
      { label: "×", onClick: () => operator("×"), variant: "operator" },
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
