"use client";
import { useMemo } from "react";
import { analyzeBase64, Base64Tool, base64ToBytes, utf8Encode, type Base64Analysis, type Base64Mode, type Base64Variant } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type B64Draft = { text: string; mode: Base64Mode; variant: Base64Variant };

/** Mixed Latin and Arabic text, so the sample shows both one-byte and two-byte UTF-8 characters. */
export const B64_DEFAULTS: B64Draft = { text: "Hello, TooloraLabs! مرحبا", mode: "encode", variant: "standard" };

export const B64_EXAMPLES: { id: string; draft: B64Draft }[] = [
  { id: "mixed", draft: B64_DEFAULTS },
  { id: "rfc", draft: { text: "foobar", mode: "encode", variant: "standard" } },
  { id: "json", draft: { text: '{"sub":"1234567890","name":"John Doe","iat":1516239022}', mode: "encode", variant: "urlSafe" } },
  { id: "basicAuth", draft: { text: "Aladdin:open sesame", mode: "encode", variant: "standard" } },
  { id: "decode", draft: { text: "QmFzZTY0IGlzIG5vdCBlbmNyeXB0aW9uLg==", mode: "decode", variant: "standard" } },
];

export const { LiveProvider: B64LiveProvider, useLiveState: useB64Live } = createLiveToolState<B64Draft>();

const tool = new Base64Tool();

export type B64Model = {
  draft: B64Draft;
  result: string;
  error: boolean;
  /** Raw bytes and their Base64 text, whichever direction was converted. */
  bytes: number[];
  b64: string;
  a: Base64Analysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildB64Model(d: B64Draft): B64Model {
  const base = { draft: d, f: nf, pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%` };
  if (!d.text.trim()) return { ...base, result: "", error: false, bytes: [], b64: "", a: null };
  const r = tool.execute({ text: d.text, mode: d.mode, variant: d.variant }, { locale: "en-US" });
  if (!r.success) return { ...base, result: "", error: true, bytes: [], b64: "", a: null };
  const bytes = d.mode === "encode" ? utf8Encode(d.text) : (base64ToBytes(d.text.trim(), d.variant) ?? []);
  const b64 = d.mode === "encode" ? r.data.result : d.text.trim();
  return { ...base, result: r.data.result, error: false, bytes, b64, a: analyzeBase64(bytes, b64, d.variant) };
}

export function useB64Model(): B64Model {
  const { dims } = useB64Live();
  return useMemo(() => buildB64Model(dims), [dims]);
}

/** Alternating group colours used wherever Base64 characters are tied back to their 3-byte group. */
export const GROUP_TEXT = ["text-blue-700 dark:text-blue-300", "text-emerald-700 dark:text-emerald-300"];
export const GROUP_FILL = ["fill-blue-600 dark:fill-blue-400", "fill-emerald-600 dark:fill-emerald-400"];
