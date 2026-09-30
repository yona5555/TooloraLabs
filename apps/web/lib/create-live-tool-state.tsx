"use client";
import { createContext, useContext, type ReactNode } from "react";

/**
 * Shared cross-page live state for one tool: the hero diagram in the education section and
 * every one of its 15 supporting indicators read the SAME numeric dimensions this returns,
 * and the dimensions are the tool's own above-the-fold draft (already updated on every
 * keystroke by the existing controlled inputs) — so typing in a field or dragging the hero
 * both flow through one source of truth instead of two copies that could drift apart.
 */
export function createLiveToolState<TDims extends Record<string, unknown>>() {
  type Value = { dims: TDims; setDim: <K extends keyof TDims>(key: K, value: TDims[K]) => void };
  const Context = createContext<Value | null>(null);

  function LiveProvider({ value, children }: { value: Value; children: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useLiveState(): Value {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("Live tool state hook used outside its Provider — check the tool's top-level component wraps both ToolAboveFold and the education section.");
    return ctx;
  }

  return { LiveProvider, useLiveState };
}
