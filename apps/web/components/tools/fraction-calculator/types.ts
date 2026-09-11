export type { FractionOperation, FractionCalculatorOutput as FractionResult } from "@tooloralabs/tools";
import type { FractionOperation } from "@tooloralabs/tools";

export type FractionScenario = {
  key: string;
  operation: FractionOperation;
  numeratorA: string;
  denominatorA: string;
  numeratorB: string;
  denominatorB: string;
};

export const FRACTION_SCENARIOS: FractionScenario[] = [
  { key: "doubleRecipe", operation: "add", numeratorA: "1", denominatorA: "2", numeratorB: "1", denominatorB: "3" },
  { key: "leftoverPizza", operation: "subtract", numeratorA: "3", denominatorA: "4", numeratorB: "1", denominatorB: "4" },
  { key: "fabricYardage", operation: "multiply", numeratorA: "2", denominatorA: "3", numeratorB: "3", denominatorB: "4" },
  { key: "roadTripSplit", operation: "divide", numeratorA: "1", denominatorA: "2", numeratorB: "1", denominatorB: "4" },
];
