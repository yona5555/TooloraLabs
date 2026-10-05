"use client";
import { useState } from "react";
import type { FractionLiveDims } from "./FractionLiveContext";

/** The tool's own default example (A=1/2, B=1/3, op=+), the exact same seed every indicator card
 * starts from -- see §37. */
export const DEFAULT_FRACTION_DIMS: FractionLiveDims = { operation: "add", numeratorA: 1, denominatorA: 2, numeratorB: 1, denominatorB: 3 };

/**
 * Per-indicator local state (§37): each indicator card 02-16 owns a private copy of this,
 * seeded ONCE on mount from the tool's default example (or a card-specific seed when a
 * different starting pair makes that indicator more interesting). Operating that card's own
 * handle only ever updates this local copy -- never the hero, the input fields, the result
 * line, or any other indicator's state. Deliberately has the exact same {dims, setDim} shape
 * as useFractionLive() so converting a card from shared to local state is a one-line import
 * swap, not a rewrite of the card's own drag/compute logic.
 */
export function useFractionCardState(seed: Partial<FractionLiveDims> = {}) {
  const [dims, setDims] = useState<FractionLiveDims>(() => ({ ...DEFAULT_FRACTION_DIMS, ...seed }));
  function setDim<K extends keyof FractionLiveDims>(key: K, value: FractionLiveDims[K]) {
    setDims((d) => ({ ...d, [key]: value }));
  }
  return { dims, setDim };
}
