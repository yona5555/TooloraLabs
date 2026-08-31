export type HouseAffordabilityMode = "homePrice" | "requiredIncome" | "car" | "business" | "personal";

export const HOUSE_AFFORDABILITY_MODES: HouseAffordabilityMode[] = ["homePrice", "requiredIncome", "car", "business", "personal"];

/** One purpose's max-affordable-amount, for the cross-purpose comparison chart/table. Deliberately excludes "requiredIncome" — a reverse question ("what income does this price need"), not a max-amount question like the other four. */
export type ComparisonPurpose = "home" | "car" | "business" | "personal";

export type ComparisonRow = {
  purpose: ComparisonPurpose;
  maxAmount: number;
};
