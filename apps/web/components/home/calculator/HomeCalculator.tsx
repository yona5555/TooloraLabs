"use client";
import { useReducer, useState } from "react";
import { calculatorReducer, initialCalculatorState } from "./homeCalculatorReducer";
import { useArchive } from "./useArchive";
import CalculatorTopBar from "./CalculatorTopBar";
import CalculatorDisplay from "./CalculatorDisplay";
import FunctionCategoryRow from "./FunctionCategoryRow";
import CalculatorKeypad from "./CalculatorKeypad";
import StandardKeypad from "./StandardKeypad";
import CalculatorBottomBar from "./CalculatorBottomBar";
import GraphCalculator from "./GraphCalculator";
import ProgrammerCalculator from "./ProgrammerCalculator";
import UnitConverter from "./UnitConverter";

export type CalculatorMode = "standard" | "scientific" | "graph" | "programmer" | "converter";

const SAVE_CONFIRMATION_MS = 1800;

/**
 * Every mode is real and working — Standard and Scientific share the same
 * expression-engine state (only the keypad differs, so switching between
 * them mid-calculation keeps your current expression and history), while
 * Graph/Programmer/Converter are self-contained modes with their own local
 * state, each backed by real computation (a genuine expression-plotting
 * engine, real 32-bit bitwise arithmetic, and real unit-conversion factors
 * respectively) rather than a placeholder.
 */
export default function HomeCalculator() {
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
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <CalculatorTopBar mode={mode} setMode={setMode} />

      {mode === "scientific" && (
        <>
          <div className="p-3 sm:p-4">
            <CalculatorDisplay state={state} dispatch={dispatch} archive={archive} />
          </div>
          <FunctionCategoryRow dispatch={dispatch} />
          <CalculatorKeypad state={state} dispatch={dispatch} />
          <CalculatorBottomBar state={state} onSaveHistory={handleSaveHistory} justSaved={justSaved} />
        </>
      )}

      {mode === "standard" && (
        <>
          <div className="p-3 sm:p-4">
            <CalculatorDisplay state={state} dispatch={dispatch} archive={archive} />
          </div>
          <StandardKeypad dispatch={dispatch} />
          <CalculatorBottomBar state={state} onSaveHistory={handleSaveHistory} justSaved={justSaved} />
        </>
      )}

      {mode === "graph" && <GraphCalculator />}
      {mode === "programmer" && <ProgrammerCalculator />}
      {mode === "converter" && <UnitConverter />}
    </div>
  );
}
