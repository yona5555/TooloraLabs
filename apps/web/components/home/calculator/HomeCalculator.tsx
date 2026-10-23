"use client";
import { useReducer, useState, useSyncExternalStore } from "react";
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

/** Below Tailwind's `md` breakpoint the calculator opens on Scientific; from `md` up, on Graph. */
const PHONE_QUERY = "(max-width: 767.98px)";

function subscribeToPhoneQuery(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function viewportDefaultMode(): CalculatorMode {
  return window.matchMedia(PHONE_QUERY).matches ? "scientific" : "graph";
}

/**
 * Every mode is real and working — Standard and Scientific share the same
 * expression-engine state (only the keypad differs, so switching between
 * them mid-calculation keeps your current expression and history), while
 * Graph/Programmer/Converter are self-contained modes with their own local
 * state, each backed by real computation (a genuine expression-plotting
 * engine, real 32-bit bitwise arithmetic, and real unit-conversion factors
 * respectively) rather than a placeholder.
 */
export default function HomeCalculator({ className = "" }: { className?: string } = {}) {
  // The tab the visitor picked wins; until then the default follows the viewport.
  // The server (and hydration) cannot know the viewport, so the default is null
  // there and the first paint shows Scientific on phones and Graph on wider
  // screens with CSS (md:hidden / max-md:hidden); right after hydration the
  // media query resolves to the mode already on screen. The wrapper elements
  // stay the same, so the visible mode never remounts.
  const [chosenMode, setMode] = useState<CalculatorMode | null>(null);
  const defaultMode = useSyncExternalStore(subscribeToPhoneQuery, viewportDefaultMode, () => null);
  const mode = chosenMode ?? defaultMode;
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);
  const { archive, saveEntries, deleteEntry, clearArchive } = useArchive();
  const [justSaved, setJustSaved] = useState(false);
  // Independent of the site-wide theme: applying "calc-dark" here only
  // activates `calcdark:` utilities within this subtree (see the calcdark
  // custom variant in globals.css), never touching <html>'s own "dark"
  // class, so this can disagree with the rest of the page in either
  // direction.
  const [calcDark, setCalcDark] = useState(false);

  function handleSaveHistory() {
    saveEntries(state.history);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), SAVE_CONFIRMATION_MS);
  }

  return (
    <div className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg calcdark:border-zinc-800 calcdark:bg-zinc-900 ${calcDark ? "calc-dark" : ""} ${className}`}>
      <CalculatorTopBar mode={mode} setMode={setMode} calcDark={calcDark} onToggleCalcDark={() => setCalcDark((v) => !v)} />

      {(mode === null || mode === "scientific") && (
        <div className={mode === null ? "contents md:hidden" : "contents"}>
          <div className="p-3 sm:p-4">
            <CalculatorDisplay state={state} dispatch={dispatch} archive={archive} onDeleteArchiveEntry={deleteEntry} onClearArchive={clearArchive} />
          </div>
          <FunctionCategoryRow dispatch={dispatch} />
          <CalculatorKeypad state={state} dispatch={dispatch} />
          <CalculatorBottomBar state={state} onSaveHistory={handleSaveHistory} justSaved={justSaved} />
        </div>
      )}

      {mode === "standard" && (
        <>
          <div className="p-3 sm:p-4">
            <CalculatorDisplay state={state} dispatch={dispatch} archive={archive} onDeleteArchiveEntry={deleteEntry} onClearArchive={clearArchive} />
          </div>
          <StandardKeypad dispatch={dispatch} />
          <CalculatorBottomBar state={state} onSaveHistory={handleSaveHistory} justSaved={justSaved} />
        </>
      )}

      {(mode === null || mode === "graph") && (
        <div className={mode === null ? "contents max-md:hidden" : "contents"}>
          <GraphCalculator calcDark={calcDark} />
        </div>
      )}
      {mode === "programmer" && <ProgrammerCalculator />}
      {mode === "converter" && <UnitConverter />}
    </div>
  );
}
