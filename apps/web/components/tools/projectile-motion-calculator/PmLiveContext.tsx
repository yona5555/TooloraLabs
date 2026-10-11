"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import { analyzeProjectile, type ProjectileAnalysis } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { ProjectileInputs } from "./types";

export const { LiveProvider: PmLiveProvider, useLiveState: usePmLive } = createLiveToolState<ProjectileInputs>();

export type PmModel = {
  /** Full analysis of the live launch, or null when the inputs are invalid. */
  a: ProjectileAnalysis | null;
  /** Localized number (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
  /** Percent with one decimal, e.g. 0.954 → "95.4%". */
  pct: (share: number) => string;
};

export function parseInputs(i: ProjectileInputs) {
  return {
    speed: parseLocalizedNumber(i.speed) || 0,
    angle: parseLocalizedNumber(i.angle) || 0,
    height: parseLocalizedNumber(i.height) || 0,
    gravity: parseLocalizedNumber(i.gravity) || 0,
  };
}

export function buildPmModel(i: ProjectileInputs): PmModel {
  const ds = resolveDigitStyle(i.speed, i.angle, i.height, i.gravity);
  const f = (v: number, max = 2) => formatLocalizedNumber(Math.abs(v) < 1e-9 ? 0 : v, ds, { maximumFractionDigits: max });
  const pct = (share: number) => `${formatLocalizedNumber(share * 100, ds, { maximumFractionDigits: 1 })}%`;
  return { a: analyzeProjectile(parseInputs(i)), f, pct };
}

/** The live launch and its full analysis, shared by the Result card and every indicator. */
export function usePmModel(): PmModel {
  const { dims } = usePmLive();
  return useMemo(() => buildPmModel(dims), [dims]);
}

/** Rounds SVG coordinates so server and browser trig never differ in the last digit (hydration). */
export const r2 = (v: number) => Math.round(v * 100) / 100;
