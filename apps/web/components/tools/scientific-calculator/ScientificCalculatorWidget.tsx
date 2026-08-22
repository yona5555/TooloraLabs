"use client";

import { useReducer, useState } from "react";
import { calculatorReducer, initialState } from "./reducer";
import ScientificKeypad from "./ScientificKeypad";
import CalculationLog, { type LogEntry } from "./CalculationLog";

const LOG_LIMIT = 5;

/**
 * Self-contained preview used outside the tool page itself (the homepage
 * hero) — no sidebar/education, just the interactive keypad plus its own
 * compact calculation log, both driven by local state.
 */
export default function ScientificCalculatorWidget() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [log, setLog] = useState<LogEntry[]>([]);
  // Mirrors of the reducer signals the log reacts to, so a change can be
  // detected and folded into `log` during render (see "adjusting state
  // during rendering" in the React docs) instead of in an effect.
  const [seenHistorySeq, setSeenHistorySeq] = useState(state.historySeq);
  const [seenErrorCode, setSeenErrorCode] = useState(state.errorCode);
  // Counts up on every logged error; negated so error ids (-1, -2, -3, …)
  // never collide with historySeq-derived success ids (0, 1, 2, …).
  const [errorCount, setErrorCount] = useState(0);

  if (state.historySeq !== seenHistorySeq) {
    setSeenHistorySeq(state.historySeq);
    const newest = state.history[0];
    if (newest) {
      setLog((prev) =>
        [{ id: newest.id, expression: newest.expression, result: newest.result, isError: false }, ...prev].slice(
          0,
          LOG_LIMIT
        )
      );
    }
  } else if (state.errorCode && state.errorCode !== seenErrorCode) {
    setSeenErrorCode(state.errorCode);
    setErrorCount((n) => n + 1);
    setLog((prev) =>
      [
        {
          id: -1 - errorCount,
          expression: state.lastErrorExpression ?? state.display,
          result: null,
          isError: true,
        },
        ...prev,
      ].slice(0, LOG_LIMIT)
    );
  } else if (state.errorCode !== seenErrorCode) {
    setSeenErrorCode(state.errorCode);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ScientificKeypad state={state} dispatch={dispatch} compact />
      <div className="min-h-0 flex-1">
        <CalculationLog entries={log} />
      </div>
    </div>
  );
}
