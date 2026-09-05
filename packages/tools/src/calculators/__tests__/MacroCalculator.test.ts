import { describe, it, expect } from "vitest";
import { MacroCalculator } from "../MacroCalculator";

const calc = new MacroCalculator();
const context = { locale: "en-US" };

describe("MacroCalculator", () => {
  it("splits calories for maintenance (20/50/30)", () => {
    const r = calc.execute({ totalCalories: 2000, goal: "maintain" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.protein.calories).toBeCloseTo(400, 5);
    expect(r.data.carbs.calories).toBeCloseTo(1000, 5);
    expect(r.data.fat.calories).toBeCloseTo(600, 5);
  });

  it("converts calories to grams using standard Atwater factors (4/4/9)", () => {
    const r = calc.execute({ totalCalories: 2000, goal: "maintain" }, context);
    expect(r.data.protein.grams).toBeCloseTo(100, 5); // 400 kcal / 4
    expect(r.data.carbs.grams).toBeCloseTo(250, 5); // 1000 kcal / 4
    expect(r.data.fat.grams).toBeCloseTo(600 / 9, 5); // 600 kcal / 9
  });

  it("weights protein higher for a fat-loss goal", () => {
    const r = calc.execute({ totalCalories: 2000, goal: "lose" }, context);
    expect(r.data.protein.percent).toBe(30);
    expect(r.data.carbs.percent).toBe(45);
    expect(r.data.fat.percent).toBe(25);
  });

  it("weights protein higher for a muscle-building goal", () => {
    const r = calc.execute({ totalCalories: 2500, goal: "buildMuscle" }, context);
    expect(r.data.protein.percent).toBe(30);
    expect(r.data.fat.percent).toBe(20);
  });

  it("emphasizes carbs for a weight-gain goal", () => {
    const r = calc.execute({ totalCalories: 3000, goal: "gain" }, context);
    expect(r.data.carbs.percent).toBeCloseTo(55, 5);
  });

  it("keeps every goal's percentages summing to 100", () => {
    for (const goal of ["lose", "maintain", "gain", "buildMuscle"] as const) {
      const r = calc.execute({ totalCalories: 2200, goal }, context);
      expect(r.data.protein.percent + r.data.carbs.percent + r.data.fat.percent).toBeCloseTo(100, 5);
    }
  });

  it("rejects non-positive or unrealistic calorie totals", () => {
    expect(calc.execute({ totalCalories: 0, goal: "maintain" }, context).data.error).toBe("invalid-calories");
    expect(calc.execute({ totalCalories: -500, goal: "maintain" }, context).data.error).toBe("invalid-calories");
    expect(calc.execute({ totalCalories: 50000, goal: "maintain" }, context).data.error).toBe("invalid-calories");
  });
});
