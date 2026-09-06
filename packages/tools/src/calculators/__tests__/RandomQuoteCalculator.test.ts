import { describe, expect, it } from "vitest";
import { RandomQuoteCalculator, QUOTES } from "../RandomQuoteCalculator";

const ctx = { locale: "en-US" };

function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("RandomQuoteCalculator", () => {
  const tool = new RandomQuoteCalculator();

  it("returns a quote with all required fields", () => {
    const result = tool.execute({ randomFn: sequence([0.1]) }, ctx);
    const quote = result.data.quote;
    expect(quote.id).toBeTruthy();
    expect(quote.text).toBeTruthy();
    expect(quote.author).toBeTruthy();
    expect(quote.source).toBeTruthy();
    expect(["motivational", "literary", "philosophical"]).toContain(quote.category);
  });

  it("returns a quote from the requested category only", () => {
    for (let i = 0; i < 20; i++) {
      const result = tool.execute({ category: "philosophical", randomFn: sequence([i / 20]) }, ctx);
      expect(result.data.quote.category).toBe("philosophical");
    }
  });

  it("can return a quote from any category when 'all' is requested", () => {
    const result = tool.execute({ category: "all", randomFn: sequence([0]) }, ctx);
    expect(QUOTES).toContainEqual(result.data.quote);
  });

  it("excludes the given quote id when the category has other quotes", () => {
    const first = tool.execute({ category: "literary", randomFn: sequence([0]) }, ctx).data.quote;
    for (let i = 0; i < 10; i++) {
      const next = tool.execute(
        { category: "literary", excludeId: first.id, randomFn: sequence([i / 10]) },
        ctx,
      ).data.quote;
      expect(next.id).not.toBe(first.id);
    }
  });

  it("is deterministic given the same randomFn", () => {
    const r1 = tool.execute({ randomFn: sequence([0.42]) }, ctx);
    const r2 = tool.execute({ randomFn: sequence([0.42]) }, ctx);
    expect(r1.data.quote.id).toBe(r2.data.quote.id);
  });

  it("has at least eight quotes in each category", () => {
    const byCategory = { motivational: 0, literary: 0, philosophical: 0 };
    for (const quote of QUOTES) byCategory[quote.category]++;
    expect(byCategory.motivational).toBeGreaterThanOrEqual(8);
    expect(byCategory.literary).toBeGreaterThanOrEqual(8);
    expect(byCategory.philosophical).toBeGreaterThanOrEqual(8);
  });

  it("has unique ids for every quote", () => {
    const ids = new Set(QUOTES.map((q) => q.id));
    expect(ids.size).toBe(QUOTES.length);
  });
});
