export type { FuelRateMode, FuelCostCalculatorOutput } from "@tooloralabs/tools";
import type { FuelRateMode } from "@tooloralabs/tools";

export type FuelScenario = {
  key: string;
  distance: string;
  rateMode: FuelRateMode;
  rateValue: string;
  pricePerUnit: string;
};

export const FUEL_SCENARIOS: FuelScenario[] = [
  { key: "dailyCommute", distance: "40", rateMode: "consumption", rateValue: "7", pricePerUnit: "1.4" },
  { key: "roadTrip", distance: "800", rateMode: "consumption", rateValue: "8", pricePerUnit: "1.5" },
  { key: "efficientHybrid", distance: "300", rateMode: "efficiency", rateValue: "20", pricePerUnit: "1.5" },
  { key: "usPickupTruck", distance: "500", rateMode: "efficiency", rateValue: "18", pricePerUnit: "3.5" },
];

export const FUEL_DEFAULTS = { distance: "500", rateMode: "consumption" as FuelRateMode, rateValue: "8", pricePerUnit: "1.5" };
