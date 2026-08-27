export type { DensityOperation, DensityCalculatorOutput as DensityResult } from "@tooloralabs/tools";

export type MaterialKey = "air" | "ice" | "water" | "aluminum" | "iron" | "gold";

export const MATERIAL_DENSITIES: Record<MaterialKey, number> = {
  air: 0.0012,
  ice: 0.92,
  water: 1.0,
  aluminum: 2.7,
  iron: 7.87,
  gold: 19.3,
};

export const MATERIAL_KEYS: MaterialKey[] = ["air", "ice", "water", "aluminum", "iron", "gold"];

/**
 * Materials shown on the diagram's scale. "ice" is intentionally excluded here:
 * its density (0.92) sits log10-adjacent to water (1.0), so their tick labels
 * would overlap illegibly at this scale. "ice" still appears in the reference table.
 */
export const DIAGRAM_MATERIAL_KEYS: MaterialKey[] = ["air", "water", "aluminum", "iron", "gold"];
