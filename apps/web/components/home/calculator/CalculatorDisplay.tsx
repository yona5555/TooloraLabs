"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { evaluateExpression } from "@/lib/home-calculator/expressionEngine";
import { formatCalculatorNumber } from "@/lib/home-calculator/formatNumber";
import type { CalculatorAction, CalculatorState, HistoryEntry } from "./homeCalculatorReducer";

type Tab = "history" | "archive";

type CalculatorDisplayProps = {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
  archive: HistoryEntry[];
};

/**
 * The Main pane always reflects state.expression live: while typing, that's
 * the raw partial expression re-evaluated on every render for a live
 * preview; right after "=", state.justEvaluated is true and history[0] is
 * exactly the "expr =" label just pushed, so the top line can show the full
 * equation instead of collapsing to just the bare result value.
 */
function useMainPaneText(state: CalculatorState, tHome: ReturnType<typeof useTranslations>) {
  const trimmed = state.expression.trim();

  const topText = state.justEvaluated && state.history[0] ? state.history[0].expression : trimmed || "0";

  let bottomText: string;
  if (state.errorCode) {
    bottomText = tHome(`errors.${state.errorCode}`);
  } else if (!trimmed || trimmed === "0") {
    bottomText = "0";
  } else {
    const preview = evaluateExpression(trimmed, state.angleMode);
    bottomText = preview.success ? formatCalculatorNumber(preview.value) : trimmed;
  }

  return { topText, bottomText };
}

function EntryRow({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="border-b border-zinc-100 px-3 py-2.5 last:border-0 dark:border-zinc-800" dir="ltr">
      <div className="truncate text-xs text-zinc-400 dark:text-zinc-500">{entry.expression}</div>
      <div className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatCalculatorNumber(entry.result)}</div>
    </div>
  );
}

export default function CalculatorDisplay({ state, dispatch, archive }: CalculatorDisplayProps) {
  const tHome = useTranslations("homeCalculator");
  const [tab, setTab] = useState<Tab>("history");
  const { topText, bottomText } = useMainPaneText(state, tHome);

  const entries = tab === "history" ? state.history : archive;
  const emptyText = tab === "history" ? tHome("display.emptyHistory") : tHome("display.emptyArchive");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
      <div
        aria-label={tHome("display.mainLabel")}
        className="flex min-h-[6.5rem] flex-col justify-end rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/70"
      >
        <div className="truncate text-end text-sm text-zinc-400 dark:text-zinc-500" dir="ltr">
          {topText}
        </div>
        <div className="mt-1 truncate text-end text-4xl font-bold text-zinc-900 dark:text-zinc-50" dir="ltr">
          {bottomText}
        </div>
      </div>

      <div className="flex min-h-[6.5rem] flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex border-b border-zinc-200 dark:border-zinc-700" role="tablist">
          {(["history", "archive"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition ${
                tab === key
                  ? "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400"
                  : "bg-zinc-50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tHome(key === "history" ? "display.historyTab" : "display.archiveTab")}
            </button>
          ))}
        </div>
        <div className="max-h-32 flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
          {entries.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">{emptyText}</p>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => dispatch({ type: "loadHistory", entry })}
                className="block w-full text-start transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <EntryRow entry={entry} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
