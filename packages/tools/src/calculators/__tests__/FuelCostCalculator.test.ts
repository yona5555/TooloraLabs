import { describe, expect, it } from "vitest";
import { FuelCostCalculator } from "../FuelCostCalculator";

const ctx = { locale: "en-US" };

describe("FuelCostCalculator", () => {
  const tool = new FuelCostCalculator();

  it("computes fuel cost using consumption mode (L/100km)", () => {
    // 500 km trip, 8 L/100km, $1.50/L
    const result = tool.execute(
      { distance: 500, rateMode: "consumption", rateValue: 8, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBeNull();
    expect(result.data.fuelUsed).toBeCloseTo(40, 5);
    expect(result.data.totalCost).toBeCloseTo(60, 5);
    expect(result.data.costPerDistanceUnit).toBeCloseTo(0.12, 5);
  });

  it("computes fuel cost using efficiency mode (km/L)", () => {
    // 500 km trip, 12.5 km/L, $1.50/L
    const result = tool.execute(
      { distance: 500, rateMode: "efficiency", rateValue: 12.5, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBeNull();
    expect(result.data.fuelUsed).toBeCloseTo(40, 5);
    expect(result.data.totalCost).toBeCloseTo(60, 5);
  });

  it("computes fuel cost using efficiency mode (mpg)", () => {
    // 300 miles, 30 mpg, $3.50/gal
    const result = tool.execute(
      { distance: 300, rateMode: "efficiency", rateValue: 30, pricePerUnit: 3.5 },
      ctx,
    );
    expect(result.data.fuelUsed).toBeCloseTo(10, 5);
    expect(result.data.totalCost).toBeCloseTo(35, 5);
  });

  it("rejects zero distance", () => {
    const result = tool.execute(
      { distance: 0, rateMode: "consumption", rateValue: 8, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-distance");
  });

  it("rejects negative distance", () => {
    const result = tool.execute(
      { distance: -10, rateMode: "consumption", rateValue: 8, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-distance");
  });

  it("rejects zero or negative rate value", () => {
    const result = tool.execute(
      { distance: 500, rateMode: "consumption", rateValue: 0, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-rate");
  });

  it("rejects zero or negative price", () => {
    const result = tool.execute(
      { distance: 500, rateMode: "consumption", rateValue: 8, pricePerUnit: 0 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-price");
  });

  it("rejects non-finite inputs", () => {
    const result = tool.execute(
      { distance: NaN, rateMode: "consumption", rateValue: 8, pricePerUnit: 1.5 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-distance");
  });
});
