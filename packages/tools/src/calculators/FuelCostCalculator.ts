import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

/**
 * "consumption" = fuel used per 100 distance units (e.g. L/100km, gal/100mi).
 * "efficiency" = distance covered per unit of fuel (e.g. km/L, mi/gal).
 */
export type FuelRateMode = "consumption" | "efficiency";

export type FuelCostCalculatorInput = {
  distance: number;
  rateMode: FuelRateMode;
  rateValue: number;
  pricePerUnit: number;
};

export type FuelCostCalculatorError = "invalid-distance" | "invalid-rate" | "invalid-price";

export type FuelCostCalculatorOutput = {
  error: FuelCostCalculatorError | null;
  fuelUsed: number;
  totalCost: number;
  costPerDistanceUnit: number;
};

export class FuelCostCalculator extends BaseCalculator<FuelCostCalculatorInput, FuelCostCalculatorOutput> {
  metadata = {
    id: "fuel-cost-calculator",
    slug: "fuel-cost-calculator",
    name: "Fuel Cost Calculator",
    category: "business-finance",
    description: "Estimate the fuel cost of a trip from distance, fuel consumption rate, and fuel price.",
    version: "1.0.0",
  };

  execute(input: FuelCostCalculatorInput, _context: ToolContext): ToolResult<FuelCostCalculatorOutput> {
    const { distance, rateMode, rateValue, pricePerUnit } = input;

    if (!Number.isFinite(distance) || distance <= 0) {
      return this.error("invalid-distance");
    }
    if (!Number.isFinite(rateValue) || rateValue <= 0) {
      return this.error("invalid-rate");
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      return this.error("invalid-price");
    }

    const fuelUsed = rateMode === "consumption" ? (distance / 100) * rateValue : distance / rateValue;
    const totalCost = fuelUsed * pricePerUnit;
    const costPerDistanceUnit = totalCost / distance;

    return {
      success: true,
      data: { error: null, fuelUsed, totalCost, costPerDistanceUnit },
      metadata: {},
    };
  }

  private error(error: FuelCostCalculatorError): ToolResult<FuelCostCalculatorOutput> {
    return {
      success: true,
      data: { error, fuelUsed: 0, totalCost: 0, costPerDistanceUnit: 0 },
      metadata: {},
    };
  }
}
