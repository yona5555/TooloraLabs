"use client";
import { useMemo } from "react";
import { analyzePasswordSettings, classifyPassword, type PasswordSettingsAnalysis } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { PasswordFormState } from "./PasswordInputPanel";

/** The form plus the password generated from it after mount (crypto randomness is client-only). */
export type PasswordDraft = PasswordFormState & { password: string; alternatives: string[] };

export const INITIAL_FORM: PasswordFormState = {
  mode: "characters",
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: false,
  wordCount: 4,
  separator: "-",
  capitalizeWords: true,
  appendNumber: false,
};

export const PASSWORD_EXAMPLES: { id: string; patch: Partial<PasswordFormState> }[] = [
  { id: "short", patch: { mode: "characters", length: 8, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false } },
  { id: "standard", patch: { mode: "characters", length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false } },
  { id: "long", patch: { mode: "characters", length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true } },
  { id: "words4", patch: { mode: "passphrase", wordCount: 4, appendNumber: false } },
  { id: "words6", patch: { mode: "passphrase", wordCount: 6, appendNumber: true } },
];

export const { LiveProvider: PasswordLiveProvider, useLiveState: usePasswordLive } = createLiveToolState<PasswordDraft>();

export type PasswordModel = {
  draft: PasswordDraft;
  s: PasswordSettingsAnalysis;
  classes: ReturnType<typeof classifyPassword> | null;
  f: (v: number, max?: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function usePasswordModel(): PasswordModel {
  const { dims } = usePasswordLive();
  return useMemo(() => ({ draft: dims, s: analyzePasswordSettings(dims), classes: dims.password ? classifyPassword(dims.password) : null, f: nf }), [dims]);
}

/** 10^x written as a readable magnitude: "3.2 × 10¹⁸" (or a plain number below a million). */
export function pow10Text(log10: number): string {
  if (log10 < 6) return nf(10 ** log10, 0);
  const e = Math.floor(log10);
  const m = 10 ** (log10 - e);
  const sup = String(e).replace(/[0-9-]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)] ?? "⁻");
  return `${nf(m, 1)} × 10${sup}`;
}

export const SECONDS_PER_YEAR = 365.25 * 86400;
export const CLASS_FILL = {
  uppercase: "fill-blue-600 dark:fill-blue-400",
  lowercase: "fill-emerald-500 dark:fill-emerald-400",
  numbers: "fill-amber-500 dark:fill-amber-400",
  symbols: "fill-rose-500 dark:fill-rose-400",
  other: "fill-zinc-400",
} as const;
export const CLASS_TEXT = {
  uppercase: "text-blue-700 dark:text-blue-300",
  lowercase: "text-emerald-700 dark:text-emerald-300",
  numbers: "text-amber-600 dark:text-amber-300",
  symbols: "text-rose-600 dark:text-rose-300",
  other: "text-zinc-600 dark:text-zinc-300",
} as const;
