"use client";
import { Delete } from "lucide-react";
import { useTranslations } from "next-intl";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { functionToken, type CalculatorAction } from "./homeCalculatorReducer";
import { KEYPAD_VARIANT_CLASSES, type KeypadVariant } from "./keypadButtonStyles";

type StandardKeypadProps = {
  dispatch: (action: CalculatorAction) => void;
};

type ButtonSpec = {
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  variant: KeypadVariant;
};

/**
 * A simpler 5-column keypad for the "Standard" mode — same underlying
 * state/engine as Scientific (this file only builds a smaller button set
 * dispatching into the exact same reducer actions), so switching between
 * Standard and Scientific mid-calculation keeps your current expression and
 * history intact. The layout mirrors the familiar Windows Standard
 * Calculator: memory row, then %/CE/C/backspace, then the 3x4 digit grid
 * with the operator column fixed on the right, matching the same
 * digit-column-alignment convention as the Scientific keypad.
 */
export default function StandardKeypad({ dispatch }: StandardKeypadProps) {
  const tHome = useTranslations("homeCalculator");

  function digit(d: string) {
    dispatch({ type: "digit", digit: d });
  }
  function operator(symbol: "+" | "-" | "×" | "÷") {
    dispatch({ type: "operator", symbol });
  }

  const rows: ButtonSpec[][] = [
    [
      { label: "mc", onClick: () => dispatch({ type: "memoryClear" }), variant: "function", ariaLabel: tHome("buttons.memoryClear") },
      { label: "mr", onClick: () => dispatch({ type: "memoryRecall" }), variant: "function", ariaLabel: tHome("buttons.memoryRecall") },
      { label: "m+", onClick: () => dispatch({ type: "memoryAdd" }), variant: "function", ariaLabel: tHome("buttons.memoryAdd") },
      { label: "m−", onClick: () => dispatch({ type: "memorySubtract" }), variant: "function", ariaLabel: tHome("buttons.memorySubtract") },
      { label: "±", onClick: () => dispatch({ type: "toggleSign" }), variant: "function", ariaLabel: tHome("buttons.plusMinus") },
    ],
    [
      { label: "%", onClick: () => dispatch({ type: "postfix", symbol: "%" }), variant: "function" },
      { label: "CE", onClick: () => dispatch({ type: "clearEntry" }), variant: "clear", ariaLabel: tHome("buttons.clearEntry") },
      { label: "C", onClick: () => dispatch({ type: "clearAll" }), variant: "clear", ariaLabel: tHome("buttons.clearAll") },
      { label: "⌫", onClick: () => dispatch({ type: "backspace" }), variant: "delete", ariaLabel: tHome("buttons.backspace") },
      { label: "÷", onClick: () => operator("÷"), variant: "operator" },
    ],
    [
      { label: "√x", onClick: () => dispatch({ type: "function", token: functionToken("sqrt", "√") }), variant: "function" },
      { label: "7", onClick: () => digit("7"), variant: "number" },
      { label: "8", onClick: () => digit("8"), variant: "number" },
      { label: "9", onClick: () => digit("9"), variant: "number" },
      { label: "×", onClick: () => operator("×"), variant: "operator" },
    ],
    [
      { label: "x²", onClick: () => dispatch({ type: "postfix", symbol: "²" }), variant: "function" },
      { label: "4", onClick: () => digit("4"), variant: "number" },
      { label: "5", onClick: () => digit("5"), variant: "number" },
      { label: "6", onClick: () => digit("6"), variant: "number" },
      { label: "−", onClick: () => operator("-"), variant: "operator" },
    ],
    [
      { label: "⅟x", onClick: () => dispatch({ type: "function", token: functionToken("reciprocal", "⅟x") }), variant: "function" },
      { label: "1", onClick: () => digit("1"), variant: "number" },
      { label: "2", onClick: () => digit("2"), variant: "number" },
      { label: "3", onClick: () => digit("3"), variant: "number" },
      { label: "+", onClick: () => operator("+"), variant: "operator" },
    ],
    [
      { label: "e", onClick: () => dispatch({ type: "constant", symbol: "e" }), variant: "function" },
      { label: "0", onClick: () => digit("0"), variant: "number" },
      { label: ".", onClick: () => dispatch({ type: "decimal" }), variant: "number" },
      { label: "Ans", onClick: () => dispatch({ type: "ans" }), variant: "function" },
      { label: "=", onClick: () => dispatch({ type: "equals" }), variant: "equals", ariaLabel: tHome("buttons.equals") },
    ],
  ];

  return (
    <div className="grid grid-cols-5 gap-1 p-2 sm:gap-1.5 sm:p-3" dir="ltr">
      {rows.flat().map((button, index) => (
        <button
          key={index}
          type="button"
          onClick={button.onClick}
          aria-label={button.ariaLabel}
          className={`flex h-10 items-center justify-center overflow-hidden rounded-lg px-1 font-semibold transition sm:h-12 ${KEYPAD_VARIANT_CLASSES[button.variant]}`}
        >
          {button.label === "⌫" ? (
            <Delete size={16} />
          ) : (
            <AutoFitText text={button.label} dir="ltr" allowWrap={false} className="font-semibold" steps={["text-base", "text-sm", "text-xs", "text-[10px]"]} />
          )}
        </button>
      ))}
    </div>
  );
}
