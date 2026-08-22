"use client";

import { useTranslations } from "next-intl";
import { Delete } from "lucide-react";
import type { ScientificOperation } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { CalculatorAction, CalculatorState, BinaryOperator } from "./reducer";

type ButtonConfig = {
  label: React.ReactNode;
  onClick: () => void;
  variant?: "number" | "operator" | "function" | "action" | "equals";
  ariaLabel?: string;
};

type ScientificKeypadProps = {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
  /** Smaller display/buttons and no inline copy button — used by the homepage hero preview, which has its own calculation log with its own copy action. */
  compact?: boolean;
};

export default function ScientificKeypad({ state, dispatch, compact = false }: ScientificKeypadProps) {
  const t = useTranslations("tools.scientific-calculator");

  function digit(d: string) {
    dispatch({ type: "digit", digit: d });
  }

  function operator(op: BinaryOperator, symbol: string) {
    dispatch({ type: "operator", operator: op, symbol });
  }

  function unary(operation: ScientificOperation, label: string) {
    dispatch({ type: "unary", operation, label });
  }

  function handleMinus() {
    if (state.display.toLowerCase().endsWith("e")) {
      dispatch({ type: "expSign" });
    } else {
      operator("subtract", "−");
    }
  }

  const rows: ButtonConfig[][] = [
    [
      {
        label: state.angleMode === "deg" ? "Deg" : "Rad",
        onClick: () => dispatch({ type: "toggleAngleMode" }),
        variant: "function",
        ariaLabel: t("buttons.angleMode"),
      },
      { label: "M+", onClick: () => dispatch({ type: "memoryAdd" }), variant: "function" },
      { label: "M-", onClick: () => dispatch({ type: "memorySubtract" }), variant: "function" },
      { label: "MR", onClick: () => dispatch({ type: "memoryRecall" }), variant: "function" },
      { label: "Ans", onClick: () => dispatch({ type: "ans" }), variant: "function" },
      { label: "AC", onClick: () => dispatch({ type: "clearAll" }), variant: "action" },
    ],
    [
      { label: "sin", onClick: () => unary("sin", "sin"), variant: "function" },
      { label: "cos", onClick: () => unary("cos", "cos"), variant: "function" },
      { label: "tan", onClick: () => unary("tan", "tan"), variant: "function" },
      { label: "sin⁻¹", onClick: () => unary("asin", "sin⁻¹"), variant: "function" },
      { label: "cos⁻¹", onClick: () => unary("acos", "cos⁻¹"), variant: "function" },
      { label: "tan⁻¹", onClick: () => unary("atan", "tan⁻¹"), variant: "function" },
    ],
    [
      { label: "π", onClick: () => dispatch({ type: "constant", value: Math.PI }), variant: "function" },
      { label: "e", onClick: () => dispatch({ type: "constant", value: Math.E }), variant: "function" },
      { label: "xʸ", onClick: () => operator("power", "^"), variant: "function" },
      { label: "x³", onClick: () => unary("cube", "cube"), variant: "function" },
      { label: "x²", onClick: () => unary("square", "sq"), variant: "function" },
      { label: "√x", onClick: () => unary("sqrt", "√"), variant: "function" },
    ],
    [
      { label: "eˣ", onClick: () => unary("exp", "eˣ"), variant: "function" },
      { label: "10ˣ", onClick: () => unary("pow10", "10ˣ"), variant: "function" },
      { label: "ʸ√x", onClick: () => operator("root", "ʸ√"), variant: "function" },
      { label: "³√x", onClick: () => unary("cbrt", "³√"), variant: "function" },
      { label: "ln", onClick: () => unary("ln", "ln"), variant: "function" },
      { label: "log", onClick: () => unary("log10", "log"), variant: "function" },
    ],
    [
      { label: "7", onClick: () => digit("7"), variant: "number" },
      { label: "8", onClick: () => digit("8"), variant: "number" },
      { label: "9", onClick: () => digit("9"), variant: "number" },
      { label: "÷", onClick: () => operator("divide", "÷"), variant: "operator" },
      { label: "×", onClick: () => operator("multiply", "×"), variant: "operator" },
      {
        label: <Delete size={18} />,
        onClick: () => dispatch({ type: "backspace" }),
        variant: "action",
        ariaLabel: t("buttons.backspace"),
      },
    ],
    [
      { label: "4", onClick: () => digit("4"), variant: "number" },
      { label: "5", onClick: () => digit("5"), variant: "number" },
      { label: "6", onClick: () => digit("6"), variant: "number" },
      { label: "−", onClick: handleMinus, variant: "operator" },
      { label: "+", onClick: () => operator("add", "+"), variant: "operator" },
      { label: "EXP", onClick: () => dispatch({ type: "exp" }), variant: "function" },
    ],
    [
      { label: "1", onClick: () => digit("1"), variant: "number" },
      { label: "2", onClick: () => digit("2"), variant: "number" },
      { label: "3", onClick: () => digit("3"), variant: "number" },
      { label: "0", onClick: () => digit("0"), variant: "number" },
      { label: ".", onClick: () => dispatch({ type: "decimal" }), variant: "number" },
      { label: "=", onClick: () => dispatch({ type: "equals" }), variant: "equals" },
    ],
  ];

  const variantClass: Record<NonNullable<ButtonConfig["variant"]>, string> = {
    number:
      "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    operator:
      "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20",
    function:
      "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700",
    action:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
    equals: "bg-blue-600 text-white hover:bg-blue-700",
  };

  return (
    <SectionCard title={t("aboveFold.calculatorTitle")} bodyClassName={compact ? "p-3" : "p-4 lg:p-5"}>
      <div className={`rounded-2xl bg-zinc-50 text-end dark:bg-zinc-800 ${compact ? "px-4 py-2.5" : "px-5 py-4"}`}>
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <span>{state.memory !== 0 ? "M" : ""}</span>
          <span className="min-h-[1.25rem] truncate">{state.lastOperationText}</span>
        </div>
        <div
          className={`overflow-x-auto whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-50 ${compact ? "mt-0.5 text-xl" : "mt-1 text-3xl"}`}
          dir="ltr"
        >
          {state.errorCode ? t(`errors.${state.errorCode}`) : state.display}
        </div>

        {!compact && !state.errorCode && (
          <div className="mt-3 flex justify-end">
            <CopyButton text={state.display} />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-6 ${compact ? "mt-3 gap-1.5" : "mt-4 gap-2"}`} dir="ltr">
        {rows.flat().map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.onClick}
            aria-label={button.ariaLabel}
            className={`flex items-center justify-center rounded-xl font-semibold transition ${compact ? "h-8 text-sm" : "h-11 text-base"} ${variantClass[button.variant ?? "number"]}`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
