import type { MetalUnit, OilUnit } from "@tooloralabs/tools";

export type CommodityId = "gold" | "silver" | "wti" | "brent";
export const COMMODITIES: CommodityId[] = ["gold", "silver", "wti", "brent"];
export const isMetal = (id: CommodityId) => id === "gold" || id === "silver";

/** Spot prices in USD: per troy ounce for metals, per barrel for oil. `null` when the provider failed. */
export type Spot = Record<CommodityId, number | null>;

export type { MetalUnit, OilUnit };
