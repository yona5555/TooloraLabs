"use client";
import { useReducer, useState } from "react";
import { useTranslations } from "next-intl";
import { calculatorReducer, initialCalculatorState } from "./homeCalculatorReducer";
import { useArchive } from "./useArchive";
import CalculatorTopBar from "./CalculatorTopBar";
import CalculatorDisplay from "./CalculatorDisplay";
import FunctionCategoryRow from "./FunctionCategoryRow";
import CalculatorKeypad from "./CalculatorKeypad";
import CalculatorBottomBar from "./CalculatorBottomBar";

export type CalculatorMode = "standard" | "scientific" | "graph" | "programmer" | "converter";

const SAVE_CONFIRMATION_MS = 1800;

/**
 * The only fully-built mode is Scientific (the one the spec details keypad
 * row by row); the other four tabs/menu entries are real, clickable, and
 * switch `mode` — but render an honest "coming soon" placeholder instead of
 * faking functionality the spec never described.
 */
export default function HomeCalculator() {
  const tHome = useTranslations("homeCalculator");
  const [mode, setMode] = useState<CalculatorMode>("scientific");
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);
  const { archive, saveEntries } = useArchive();
  const [justSaved, setJustSaved] = useState(false);

  function handleSaveHistory() {
    saveEntries(state.history);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), SAVE_CONFIRMATION_MS);
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900">
      <CalculatorTopBar mode={mode} setMode={setMode} />

      {mode === "scientific" ? (
        <>
          <div className="p-3 sm:p-4">
            <CalculatorDisplay state={state} dispatch={dispatch} archive={archive} />
          </div>
          <FunctionCategoryRow dispatch={dispatch} />
          <div className="flex-1" />
          <CalculatorKeypad state={state} dispatch={dispatch} />
          <CalculatorBottomBar state={state} onSaveHistory={handleSaveHistory} justSaved={justSaved} />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">{tHome(`modes.${mode}`)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{tHome("modes.comingSoon")}</p>
        </div>
      )}
    </div>
  );
}
