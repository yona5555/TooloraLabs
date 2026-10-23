"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Trash2 } from "lucide-react";
import { sumHistoryResults } from "@tooloralabs/tools";
import { evaluateExpression } from "@/lib/home-calculator/expressionEngine";
import { formatCalculatorNumber } from "@/lib/home-calculator/formatNumber";
import type { CalculatorAction, CalculatorState, HistoryEntry } from "./homeCalculatorReducer";

type Tab = "history" | "archive";

const COPY_CONFIRMATION_MS = 1500;

type CalculatorDisplayProps = {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
  archive: HistoryEntry[];
  onDeleteArchiveEntry: (id: number) => void;
  onClearArchive: () => void;
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
    <div className="border-b border-zinc-100 px-3 py-2.5 last:border-0 calcdark:border-zinc-800 max-md:py-1.5" dir="ltr">
      <div className="truncate text-xs text-zinc-400 calcdark:text-zinc-500">{entry.expression}</div>
      <div className="truncate text-lg font-semibold text-zinc-900 calcdark:text-zinc-50 max-md:text-base">{formatCalculatorNumber(entry.result)}</div>
    </div>
  );
}

export default function CalculatorDisplay({ state, dispatch, archive, onDeleteArchiveEntry, onClearArchive }: CalculatorDisplayProps) {
  const tHome = useTranslations("homeCalculator");
  const [tab, setTab] = useState<Tab>("history");
  const [totalCopied, setTotalCopied] = useState(false);
  const { topText, bottomText } = useMainPaneText(state, tHome);

  const entries = tab === "history" ? state.history : archive;
  const emptyText = tab === "history" ? tHome("display.emptyHistory") : tHome("display.emptyArchive");
  const { total, skipped } = sumHistoryResults(entries.map((entry) => entry.result));
  const totalText = formatCalculatorNumber(total);

  function deleteEntry(id: number) {
    if (tab === "history") dispatch({ type: "deleteHistory", id });
    else onDeleteArchiveEntry(id);
  }

  function clearEntries() {
    if (tab === "history") dispatch({ type: "clearHistory" });
    else onClearArchive();
  }

  async function copyTotal() {
    await navigator.clipboard.writeText(totalText);
    setTotalCopied(true);
    setTimeout(() => setTotalCopied(false), COPY_CONFIRMATION_MS);
  }

  // Desktop keeps the panel's outer height exactly as before: the list shrinks
  // by the total row's 2rem whenever the row shows (from two entries, the old
  // list already filled its 8rem cap). With a single entry the total equals
  // that entry, so on desktop the row is left out instead of growing the panel.
  // Phones keep the whole card compact (one 52px entry row visible, the rest scroll) so the
  // display and keypad below it stay on screen.
  const listHeight = entries.length === 0 ? "max-h-32" : entries.length === 1 ? "max-h-[52px] md:max-h-32" : "max-h-[52px] md:max-h-24";

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.4fr_1fr] md:gap-3">
      <div
        aria-label={tHome("display.mainLabel")}
        className="flex min-h-[6.5rem] flex-col justify-end rounded-xl border border-blue-100 bg-gradient-to-b from-zinc-50 to-blue-50/40 px-4 py-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] calcdark:border-blue-500/20 calcdark:from-zinc-800 calcdark:to-zinc-800/60 calcdark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
      >
        <div className="truncate text-end text-sm text-zinc-500 calcdark:text-zinc-400" dir="ltr">
          {topText}
        </div>
        <div data-fit className="mt-1 truncate text-end text-4xl font-extrabold text-zinc-900 calcdark:text-white" dir="ltr">
          {bottomText}
        </div>
      </div>

      <div data-history-panel className="flex min-h-[6.5rem] flex-col overflow-hidden rounded-xl border border-zinc-200 calcdark:border-zinc-700 max-md:order-first">
        <div className="flex border-b border-zinc-200 calcdark:border-zinc-700">
          <div className="flex flex-1" role="tablist">
            {(["history", "archive"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex-1 px-3 py-2 text-xs font-semibold transition ${
                  tab === key
                    ? "bg-white text-blue-600 calcdark:bg-zinc-900 calcdark:text-blue-400"
                    : "bg-zinc-50 text-zinc-500 hover:text-zinc-700 calcdark:bg-zinc-800/40 calcdark:text-zinc-400 calcdark:hover:text-zinc-200"
                }`}
              >
                {tHome(key === "history" ? "display.historyTab" : "display.archiveTab")}
              </button>
            ))}
          </div>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={clearEntries}
              className="flex shrink-0 items-center gap-1 border-s border-zinc-200 bg-zinc-50 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 max-md:min-h-9 calcdark:border-zinc-700 calcdark:bg-zinc-800/40 calcdark:text-red-400 calcdark:hover:bg-red-500/10"
            >
              <Trash2 size={13} />
              {tHome("display.clearAll")}
            </button>
          )}
        </div>
        <div className={`${listHeight} flex-1 overflow-y-auto bg-white calcdark:bg-zinc-900`}>
          {entries.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-zinc-400 calcdark:text-zinc-500">{emptyText}</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="group relative">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "loadHistory", entry })}
                  className="block w-full pe-12 text-start transition hover:bg-zinc-50 md:pe-10 calcdark:hover:bg-zinc-800/60"
                >
                  <EntryRow entry={entry} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  aria-label={tHome("display.deleteEntry", { expression: entry.expression })}
                  className="absolute inset-y-0 end-1 my-auto flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:h-8 md:w-8 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 calcdark:text-zinc-500 calcdark:hover:bg-red-500/10 calcdark:hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
        {entries.length > 0 && (
          <div
            className={`flex h-11 shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 ps-3 pe-1 md:h-8 calcdark:border-zinc-700 calcdark:bg-zinc-800/40 ${entries.length === 1 ? "md:hidden" : ""}`}
          >
            <span className="shrink-0 text-xs font-semibold text-zinc-500 calcdark:text-zinc-400">{tHome("display.grandTotal")}</span>
            {skipped > 0 && (
              <span className="shrink-0 text-[10px] text-zinc-400 calcdark:text-zinc-500">{tHome("display.skippedEntries", { count: skipped })}</span>
            )}
            <span dir="ltr" className="ms-auto min-w-0 truncate text-sm font-bold text-zinc-900 calcdark:text-zinc-50" data-grand-total>
              {totalText}
            </span>
            <button
              type="button"
              onClick={copyTotal}
              aria-label={tHome(totalCopied ? "display.totalCopied" : "display.copyTotal")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:h-7 md:w-7 calcdark:text-zinc-500 calcdark:hover:bg-zinc-700/70 calcdark:hover:text-zinc-200"
            >
              {totalCopied ? <Check size={14} className="text-green-600 calcdark:text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
