"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { GraphAnalysis, RealFunction } from "@tooloralabs/tools";

export type GraphLive = {
  expression: string;
  xMin: number;
  xMax: number;
  f: RealFunction;
  analysis: GraphAnalysis;
  traceX: number;
  setTraceX: (x: number | ((prev: number) => number)) => void;
};

const Ctx = createContext<GraphLive | null>(null);

export function GraphLiveProvider({ value, children }: { value: GraphLive; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Last valid function study, shared by the Result card, the encyclopedia drawing and every indicator. */
export function useGraphLive(): GraphLive {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGraphLive must be used inside GraphLiveProvider");
  return v;
}
