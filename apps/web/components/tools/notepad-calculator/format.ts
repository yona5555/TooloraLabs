import { formatNotepadNumber } from "@tooloralabs/tools";

/** The exact number the answer column prints (8 dp, no trailing zeros). */
export const raw = formatNotepadNumber;

const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
/** Grouped for charts and the hero (1,420.5); numbers stay Western and LTR like the notes themselves. */
export const num = (v: number) => grouped.format(v);

const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
export const compact = (v: number) => (Math.abs(v) >= 10000 ? compactFmt.format(v) : num(v));

export const pct = (v: number, digits = 1) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(v)}%`;
export const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${num(Math.abs(v))}`;

/** Line label as the visitor sees it in the editor (1-based). */
export const lineNo = (index: number) => `L${index + 1}`;

/** A round step so an axis shows about `count` grid lines. */
export function niceStep(span: number, count = 5): number {
  if (!(span > 0)) return 1;
  const rawStep = span / count;
  const p = 10 ** Math.floor(Math.log10(rawStep));
  const m = rawStep / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

export const KIND_COLORS = { assign: "#2563eb", expr: "#8b5cf6", note: "#a1a1aa", blank: "#e4e4e7" } as const;
export const OP_COLORS = { add: "#0ea5e9", mul: "#f59e0b", pow: "#db2777", fn: "#0d9488", neg: "#65a30d" } as const;
