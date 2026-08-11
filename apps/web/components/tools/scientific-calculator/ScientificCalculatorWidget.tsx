"use client";

import { useReducer } from "react";
import { calculatorReducer, initialState } from "./reducer";
import ScientificKeypad from "./ScientificKeypad";

/**
 * Self-contained preview used outside the tool page itself (the homepage
 * hero) — no history/sidebar/education, just the interactive keypad with its
 * own local state.
 */
export default function ScientificCalculatorWidget() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  return <ScientificKeypad state={state} dispatch={dispatch} />;
}
