/**
 * Chart label size in rendered CSS px (visuals.md: chart axis labels render at >= 12 CSS px).
 *
 * An SVG `font-size` is in viewBox units, so a chart that CSS scales down (fixed viewBox in a narrower
 * box, e.g. `svg { max-width: 100% }` below lg) shrinks its labels with it: 10 units at 0.5x is 5px.
 * `SvgLabelScale` (mounted once per tool page) sets `--svg-k` on every SVG to its viewBox units per
 * rendered px (1 when the chart is not scaled down). The returned CSS value keeps the authored size
 * `n` and never lets a label render below 12 CSS px; use it as `style={{ fontSize: svgPx(n) }}`.
 * A diagram that is not a chart (a flow or formula diagram with no axis or scale) is marked
 * `data-annotation` on its <svg> and keeps plain authored `fontSize` units.
 */
export const MIN_LABEL_PX = 12;

export function svgPx(n: number): string {
  return n <= MIN_LABEL_PX ? `calc(${MIN_LABEL_PX}px * var(--svg-k, 1))` : `max(${n}px, calc(${MIN_LABEL_PX}px * var(--svg-k, 1)))`;
}
