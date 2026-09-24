"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Sigma, Dices, Spline } from "lucide-react";
import type { ScientificOperation } from "@tooloralabs/tools";
import { functionToken, type CalculatorAction } from "./homeCalculatorReducer";

type CategoryKey = "trigonometry" | "probability" | "calculus";

type FunctionCategoryRowProps = {
  dispatch: (action: CalculatorAction) => void;
};

const TRIG_BUTTONS = ["sin", "cos", "tan", "cot", "sec", "csc", "sin⁻¹", "cos⁻¹", "tan⁻¹"] as const;
const TRIG_OP_MAP: Record<(typeof TRIG_BUTTONS)[number], ScientificOperation> = {
  sin: "sin",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  sec: "sec",
  csc: "csc",
  "sin⁻¹": "asin",
  "cos⁻¹": "acos",
  "tan⁻¹": "atan",
};

const CATEGORY_ICONS: Record<CategoryKey, typeof Sigma> = {
  trigonometry: Spline,
  probability: Dices,
  calculus: Sigma,
};

/**
 * Trigonometry and Probability expand into real quick-access buttons that
 * dispatch straight into the shared expression engine — no separate math,
 * just faster access to operations the main keypad already exposes (or, for
 * cot/sec/csc, exposes only here to keep the always-visible keypad at
 * exactly the spec's 6 rows). Calculus is an honest "coming soon" — the
 * engine has no derivative/integral support, and the site's convention
 * elsewhere is to say so plainly rather than fake a disabled button.
 */
export default function FunctionCategoryRow({ dispatch }: FunctionCategoryRowProps) {
  const tHome = useTranslations("homeCalculator");
  const [open, setOpen] = useState<CategoryKey | null>(null);

  function toggle(key: CategoryKey) {
    setOpen((prev) => (prev === key ? null : key));
  }

  function pressFunction(label: (typeof TRIG_BUTTONS)[number]) {
    dispatch({ type: "function", token: functionToken(TRIG_OP_MAP[label], label) });
  }

  const categories: CategoryKey[] = ["trigonometry", "probability", "calculus"];

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex">
        {categories.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          const isOpen = open === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
              className={`flex flex-1 items-center justify-center gap-1.5 border-e border-zinc-200 px-2 py-2 text-xs font-semibold transition last:border-e-0 sm:text-sm dark:border-zinc-800 ${
                isOpen ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Icon size={14} />
              <span className="truncate">{tHome(`functionCategories.${key}`)}</span>
              <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          );
        })}
      </div>

      {open === "trigonometry" && (
        <div className="flex flex-wrap gap-1.5 bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/40" dir="ltr">
          {TRIG_BUTTONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => pressFunction(label)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {open === "probability" && (
        <div className="flex flex-wrap gap-1.5 bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/40" dir="ltr">
          <button
            type="button"
            onClick={() => dispatch({ type: "postfix", symbol: "!" })}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            x!
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "postfix", symbol: "%" })}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            %
          </button>
        </div>
      )}

      {open === "calculus" && (
        <div className="bg-zinc-50 px-3 py-2.5 text-center text-xs text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-400">
          {tHome("functionCategories.calculusComingSoon")}
        </div>
      )}
    </div>
  );
}
