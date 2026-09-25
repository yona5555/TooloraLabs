export type KeypadVariant = "number" | "operator" | "function" | "clear" | "delete" | "equals" | "toggle";

/**
 * Shared across every keypad in the homepage calculator (Scientific,
 * Standard) so a digit looks and behaves identically no matter which mode
 * renders it. Every variant gets a "raised keycap" bevel via a solid
 * bottom-edge shadow (not a blurred drop shadow, which would look like it
 * floats rather than has depth) that collapses to flat + a 1px downward
 * shift on :active, so pressing a key actually looks pressed.
 *
 * Numbers are deliberately the LIGHTEST, most prominent buttons — the
 * opposite of the surrounding function buttons — with the heaviest shadow
 * of any non-operator variant, since they're what a user presses far more
 * than anything else on the pad. An earlier version used near-identical
 * gray tones for "number" and "function" in dark mode (bg-zinc-700 vs
 * bg-zinc-700/80 over a dark card — visually indistinguishable), which read
 * as one undifferentiated gray mass; numbers now sit lighter than function
 * buttons in both themes, with function buttons pushed darker and their
 * text muted, so the two read as genuinely different button classes at a
 * glance, not just "the same button with more or less text."
 */
export const KEYPAD_VARIANT_CLASSES: Record<KeypadVariant, string> = {
  number:
    "border border-zinc-300 bg-white text-zinc-900 shadow-[0_3px_0_rgba(0,0,0,0.15)] hover:bg-zinc-50 active:translate-y-px active:shadow-none dark:border-zinc-400 dark:bg-zinc-500 dark:text-white dark:shadow-[0_3px_0_rgba(0,0,0,0.65)] dark:hover:bg-zinc-400",
  operator:
    "bg-blue-500 text-white shadow-[0_3px_0_rgba(29,78,216,0.9)] hover:bg-blue-400 active:translate-y-px active:shadow-[0_1px_0_rgba(29,78,216,0.9)] dark:bg-blue-500 dark:shadow-[0_3px_0_rgba(30,58,138,1)] dark:hover:bg-blue-400",
  function:
    "border border-zinc-200 bg-zinc-100 text-zinc-700 shadow-[0_2px_0_rgba(0,0,0,0.06)] hover:bg-zinc-200 active:translate-y-px active:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:shadow-[0_2px_0_rgba(0,0,0,0.35)] dark:hover:bg-zinc-700",
  clear:
    "bg-amber-500 text-white shadow-[0_3px_0_rgba(180,83,9,0.9)] hover:bg-amber-400 active:translate-y-px active:shadow-[0_1px_0_rgba(180,83,9,0.9)] dark:bg-amber-500 dark:shadow-[0_3px_0_rgba(120,53,15,1)] dark:hover:bg-amber-400",
  delete:
    "bg-red-500 text-white shadow-[0_3px_0_rgba(185,28,28,0.9)] hover:bg-red-400 active:translate-y-px active:shadow-[0_1px_0_rgba(185,28,28,0.9)] dark:bg-red-500 dark:shadow-[0_3px_0_rgba(127,29,29,1)] dark:hover:bg-red-400",
  equals:
    "bg-blue-600 text-white shadow-[0_3px_0_rgba(30,58,138,0.9)] hover:bg-blue-500 active:translate-y-px active:shadow-[0_1px_0_rgba(30,58,138,0.9)] dark:bg-blue-600 dark:shadow-[0_3px_0_rgba(23,37,84,1)] dark:hover:bg-blue-500",
  toggle:
    "border border-zinc-200 bg-zinc-100 text-zinc-700 shadow-[0_2px_0_rgba(0,0,0,0.06)] hover:bg-zinc-200 active:translate-y-px active:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:shadow-[0_2px_0_rgba(0,0,0,0.35)] dark:hover:bg-zinc-700",
};
