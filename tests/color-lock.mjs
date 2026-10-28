// Color part of the desktop and phone home locks: every locked element also records its computed
// background-color, color and border-color in the light and the dark theme, and any difference from the
// approved baseline fails exactly like a moved rect (approval: the same approve-*-baseline flow).
// Pure logic (no browser), so tests/color-lock.test.mjs can prove it. The in-page reader lives in each
// lock's measure(), which must stay self-contained for page.evaluate.

export const COLOR_PROPS = ["background-color", "color", "border-color"];
export const THEMES = ["light", "dark"];

/**
 * Compares one element's colors. `base` and `cur` are { light: [bg, color, border], dark: [...] }.
 * Returns one problem line per changed property, naming the element, the theme, the property and the
 * approved and new values. A baseline written before the color lock has no colors: that fails too, so the
 * colors are always approved once through the label flow before the lock can pass.
 */
export function compareColors(where, base, cur) {
  if (!base) return [`${where}: no approved colors in the baseline`];
  if (!cur) return [`${where}: colors not measured`];
  const problems = [];
  for (const theme of THEMES) {
    COLOR_PROPS.forEach((prop, i) => {
      const was = base[theme]?.[i], now = cur[theme]?.[i];
      if (was !== now) problems.push(`${where} ${theme} ${prop}: ${now} (approved ${was})`);
    });
  }
  return problems;
}
