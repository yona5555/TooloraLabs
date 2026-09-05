import { describe, expect, it } from "vitest";
import { DiceRollerCalculator } from "../DiceRollerCalculator";

const ctx = { locale: "en-US" };

function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("DiceRollerCalculator", () => {
  const tool = new DiceRollerCalculator();

  it("rolls a single die deterministically via injected randomFn", () => {
    const result = tool.execute(
      { diceCount: 1, faces: 6, randomFn: sequence([0.99999]) },
      ctx,
    );
    expect(result.data.error).toBeNull();
    expect(result.data.rolls).toEqual([6]);
    expect(result.data.total).toBe(6);
  });

  it("rolls the minimum face value when randomFn returns 0", () => {
    const result = tool.execute(
      { diceCount: 1, faces: 20, randomFn: sequence([0]) },
      ctx,
    );
    expect(result.data.rolls).toEqual([1]);
  });

  it("rolls multiple dice and sums the total", () => {
    const result = tool.execute(
      { diceCount: 3, faces: 6, randomFn: sequence([0, 0.5, 0.99999]) },
      ctx,
    );
    expect(result.data.rolls).toEqual([1, 4, 6]);
    expect(result.data.total).toBe(11);
    expect(result.data.diceCount).toBe(3);
  });

  it("defaults to Math.random when no randomFn is provided", () => {
    const result = tool.execute({ diceCount: 2, faces: 6 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.rolls).toHaveLength(2);
    for (const roll of result.data.rolls) {
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    }
  });

  it("rejects a dice count below 1", () => {
    const result = tool.execute({ diceCount: 0, faces: 6 }, ctx);
    expect(result.data.error).toBe("invalid-dice-count");
    expect(result.data.rolls).toEqual([]);
  });

  it("rejects a dice count above the maximum", () => {
    const result = tool.execute({ diceCount: 21, faces: 6 }, ctx);
    expect(result.data.error).toBe("invalid-dice-count");
  });

  it("rejects a non-integer dice count", () => {
    const result = tool.execute({ diceCount: 2.5, faces: 6 }, ctx);
    expect(result.data.error).toBe("invalid-dice-count");
  });

  it("rejects an unsupported face count", () => {
    const result = tool.execute(
      { diceCount: 1, faces: 7 as unknown as 6 },
      ctx,
    );
    expect(result.data.error).toBe("invalid-faces");
  });

  it("accepts every supported face count", () => {
    for (const faces of [4, 6, 8, 10, 12, 20] as const) {
      const result = tool.execute(
        { diceCount: 1, faces, randomFn: sequence([0]) },
        ctx,
      );
      expect(result.data.error).toBeNull();
      expect(result.data.rolls).toEqual([1]);
    }
  });
});
