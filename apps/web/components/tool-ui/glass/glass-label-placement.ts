/**
 * §39: the one shared label-collision helper every indicator (and the hero) runs its own text
 * labels through before drawing them. Takes a 1D set of label centers along a single axis (the
 * common case for a number line, a tick row, or a ribbon's inline captions) and nudges any pair
 * that would overlap apart by the smallest amount that clears them, left-to-right, without ever
 * reordering two labels relative to each other (a nudged label keeps the same left-to-right rank
 * it started with, so it still sits nearest its own anchor/leader line).
 *
 * Deliberately small and dependency-free: a full 2D box-collision solver is out of scope for what
 * every one of these cards actually needs (a row of short captions along a line), and a generic
 * solver would be harder to reason about at the extreme-drag states this exists to protect.
 */
export type LabelInput = { key: string; center: number; halfWidth: number };

/** Returns each label's adjusted center, keeping left-to-right order and spacing every
 * neighbouring pair by at least `minGap` between their half-width boxes. */
export function avoidOverlap1D(labels: LabelInput[], minGap = 2): Record<string, number> {
  if (labels.length === 0) return {};
  const sorted = [...labels].sort((a, b) => a.center - b.center);
  const adjusted: { key: string; center: number; halfWidth: number }[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = adjusted[i - 1];
    const cur = { ...sorted[i] };
    const minCenter = prev.center + prev.halfWidth + minGap + cur.halfWidth;
    if (cur.center < minCenter) cur.center = minCenter;
    adjusted.push(cur);
  }
  const out: Record<string, number> = {};
  for (const l of adjusted) out[l.key] = l.center;
  return out;
}

/** Axis-aligned box overlap test used by the conformance suite (and available to any card that
 * wants a cheap runtime guard) -- two boxes given as {x, y, width, height} in the same units. */
export function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
