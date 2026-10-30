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

/**
 * Compares the controls inside main (buttons, tabs, inputs, selects, links), which the desktop lock records
 * for their colors only. `labels` are the controls in document order; `colors` are the matching
 * { element: { light, dark } } items. A changed count or label fails by name, then each control's colors
 * are compared like any other locked element.
 */
export function compareControls(view, baseLabels, baseColors, curLabels, curColors) {
  if (!baseLabels || !baseColors) return [`${view} controls: no approved colors in the baseline`];
  const problems = [];
  if (baseLabels.length !== curLabels.length) problems.push(`${view} controls: ${curLabels.length} (approved ${baseLabels.length})`);
  for (let i = 0; i < Math.min(baseLabels.length, curLabels.length); i++) {
    const where = `${view} controls #${i} "${baseLabels[i]}"`;
    if (baseLabels[i] !== curLabels[i]) { problems.push(`${where}: order changed (now "${curLabels[i]}")`); break; }
    problems.push(...compareColors(`${where} element`, baseColors[i]?.element, curColors[i]?.element));
  }
  return problems;
}
