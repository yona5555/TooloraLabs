const LRI = "⁦"; // Left-to-Right Isolate
const PDI = "⁩"; // Pop Directional Isolate

/**
 * Wraps a value (a formatted number, currency, or unit string) in Unicode
 * directional-isolate marks so it renders correctly wherever it's embedded
 * inside RTL prose — e.g. a JS-built comparison sentence like "أكثر بـ{amount}
 * من {label}" where `amount` is "$1.00". Without this, the bidi algorithm can
 * flip the currency symbol to the wrong side of the number (rendering "$1.00"
 * as "1.00$") when it's the first strong-LTR run directly adjacent to Arabic
 * text, inconsistent with the same value rendered elsewhere (e.g. inside a
 * parenthetical) where it happens to isolate correctly on its own.
 *
 * Only needed for values built as plain strings and interpolated into a
 * translated sentence via next-intl's `t()`. A value rendered in its own
 * dedicated element (e.g. inside a `dir="ltr"` container with no surrounding
 * RTL text) doesn't need this.
 */
export function ltrIsolate(value: string): string {
  return `${LRI}${value}${PDI}`;
}
