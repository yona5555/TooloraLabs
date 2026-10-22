// Pure layout values shared by the result scene's HTML overlay and its 3D canvas;
// kept apart from StoichiometryResultScene3D so the overlay does not pull three.js
// into the page before the lazily loaded scene needs it.

export type StoItem = {
  formula: string;
  coefficient: number;
  side: "reactant" | "product";
  role: "known" | "co" | "target" | "side";
  /** Mass (g) and amount (mol) from the calculator's moles and the coefficient ratio. */
  mass: number;
  moles: number;
};
export type StoSceneProps = { items: StoItem[]; ratio: string };

export const ROLE_TOKEN: Record<StoItem["role"], string> = { known: "--chem-reactant", co: "--chem-solute", target: "--chem-product", side: "--chem-cold" };

/** Molecules drawn per substance: the balanced coefficient, at most 6 (a "×n" label beyond that). */
export const MAX_SHOWN = 6;
export const shownCount = (coefficient: number) => Math.max(1, Math.min(MAX_SHOWN, Math.round(coefficient)));
/** Molecules of one substance as a tidy cluster: one column of up to 3, two columns beyond (≤ 3 rows). */
export const gridDims = (count: number) => {
  const cols = count <= 3 ? 1 : 2;
  return { cols, rows: Math.ceil(count / cols) };
};

/** Slots across the width (reactants, the arrow, products); the HTML value row uses the same inset. */
export const INSET = 0.02;
