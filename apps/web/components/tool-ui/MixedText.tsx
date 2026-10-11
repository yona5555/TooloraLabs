import type { ReactNode } from "react";

/**
 * Helpers for text that mixes words (possibly Arabic/Hindi) with formulas and numbers.
 * - Monospace breaks Arabic letter joining, so word runs keep the proportional (sans) font
 *   and only formula/number runs use the mono font.
 * - Formula/number runs are isolated as LTR, so "I = 1 A · السطوع 25%" keeps its order on RTL pages.
 * - `X_y` (e.g. F_b, ρ_w, F_max) renders as a real subscript, never a literal underscore.
 */

/** Unicode isolates: the plain-text equivalent of <bdi dir="ltr">, for SVG <text> and canvas labels. */
export const LRI = "⁦";
export const PDI = "⁩";
export const ltr = (s: string) => `${LRI}${s}${PDI}`;

const SCRIPT = "\\u0590-\\u08FF\\u0900-\\u097F\\uFB1D-\\uFDFF\\uFE70-\\uFEFF";
const WORD_RE = new RegExp(`[${SCRIPT}]`);
const WORD_RUN = new RegExp(`[${SCRIPT}]+(?:[\\s\\u200c\\u200d،؛:.]+[${SCRIPT}]+)*`, "g");

/** True when the text contains RTL or Devanagari words (which must not be set in monospace). */
export const hasWords = (s: unknown) => typeof s === "string" && WORD_RE.test(s);

const SUB_RE = /([A-Za-zρΔσμ])_(\{[^}]+\}|[A-Za-z0-9]+)/g;

/** Split text into plain parts and subscript parts (`F_b` → "F" + sub "b"). */
export function subParts(text: string): { text: string; sub: boolean }[] {
  const out: { text: string; sub: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(SUB_RE)) {
    const i = m.index ?? 0;
    out.push({ text: text.slice(last, i) + m[1], sub: false });
    out.push({ text: m[2].replace(/^\{|\}$/g, ""), sub: true });
    last = i + m[0].length;
  }
  if (last < text.length || out.length === 0) out.push({ text: text.slice(last), sub: false });
  return out.filter((p) => p.text !== "");
}

/** HTML: `X_y` → X<sub>y</sub>. */
export function Subs({ text }: { text: string }): ReactNode {
  const parts = subParts(text);
  if (parts.length === 1 && !parts[0].sub) return text;
  return parts.map((p, i) => (p.sub ? <sub key={i}>{p.text}</sub> : <span key={i}>{p.text}</span>));
}

/** SVG: `X_y` → X<tspan baseline-shift="sub">y</tspan>, for use inside a <text>. */
export function SvgSubs({ text }: { text: string }): ReactNode {
  const parts = subParts(text);
  if (parts.length === 1 && !parts[0].sub) return text;
  return parts.map((p, i) =>
    p.sub ? (
      <tspan key={i} baselineShift="sub" fontSize="75%">
        {p.text}
      </tspan>
    ) : (
      <tspan key={i}>{p.text}</tspan>
    ),
  );
}

/**
 * HTML: word runs in the inherited sans font, every other run (numbers, formulas, units) in
 * <bdi dir="ltr"> with `monoClass`, subscripts rendered. Put it in a dir="auto" (or page-dir) parent.
 */
export function MixedText({ text, monoClass = "font-mono" }: { text: string; monoClass?: string }): ReactNode {
  if (!hasWords(text)) {
    return (
      <bdi dir="ltr" className={monoClass}>
        <Subs text={text} />
      </bdi>
    );
  }
  const out: ReactNode[] = [];
  let last = 0;
  const pushRun = (s: string, key: number) => {
    const core = s.trim();
    if (!core) {
      if (s) out.push(s);
      return;
    }
    const lead = s.slice(0, s.indexOf(core));
    const tail = s.slice(s.indexOf(core) + core.length);
    if (lead) out.push(lead);
    out.push(
      <bdi key={`n${key}`} dir="ltr" className={monoClass}>
        <Subs text={core} />
      </bdi>,
    );
    if (tail) out.push(tail);
  };
  let k = 0;
  for (const m of text.matchAll(WORD_RUN)) {
    const i = m.index ?? 0;
    pushRun(text.slice(last, i), k++);
    out.push(<span key={`w${k++}`}>{m[0]}</span>);
    last = i + m[0].length;
  }
  pushRun(text.slice(last), k++);
  return out;
}
