// Pure helpers shared by the result scene's HTML overlay and its 3D canvas; kept
// apart from MolarMassResultScene3D so the overlay does not pull three.js into the
// page before the lazily loaded scene needs it.
import type { Part } from "./mmMath";

export type MmSceneProps = { formula: string; parts: Part[]; totalText: string; formulaLabel: string; atomsText: string; drawMolecule: boolean };

/**
 * Element label heights along the mass column: each at its segment's centre, pushed apart so two
 * labels are never closer than `gap` (small shares like H in glucose never overlap their neighbours).
 */
export function spreadLabels(centres: number[], gap: number, lo: number, hi: number): number[] {
  const out = centres.map((c) => Math.max(lo, Math.min(hi, c)));
  for (let i = 1; i < out.length; i++) out[i] = Math.max(out[i], out[i - 1] + gap);
  const over = out.length ? out[out.length - 1] - hi : 0;
  if (over > 0) for (let i = out.length - 1; i >= 0; i--) out[i] = i === out.length - 1 ? hi : Math.min(out[i], out[i + 1] - gap);
  return out;
}
