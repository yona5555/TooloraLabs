// The production build guard: Vercel Production needs every market API key; other builds do not.
import { describe, expect, it } from "vitest";
import { MARKET_API_KEYS, assertMarketApiKeysForProduction } from "@/lib/api-key";

const allKeys = Object.fromEntries(MARKET_API_KEYS.map((name) => [name, "set"]));

describe("assertMarketApiKeysForProduction", () => {
  it("passes on production with every key set", () => {
    expect(() => assertMarketApiKeysForProduction({ VERCEL_ENV: "production", ...allKeys })).not.toThrow();
  });

  it.each(MARKET_API_KEYS)("fails on production without %s, naming only that key", (missing) => {
    for (const value of [undefined, ""]) {
      const env = { VERCEL_ENV: "production", ...allKeys, [missing]: value };
      expect(() => assertMarketApiKeysForProduction(env)).toThrow(missing);
      try {
        assertMarketApiKeysForProduction(env);
      } catch (error) {
        const message = (error as Error).message;
        for (const other of MARKET_API_KEYS.filter((name) => name !== missing)) expect(message).not.toContain(other);
      }
    }
  });

  it("names every missing key at once on production", () => {
    expect(() => assertMarketApiKeysForProduction({ VERCEL_ENV: "production" })).toThrow(MARKET_API_KEYS.join(", "));
  });

  it.each([undefined, "preview", "development"])("passes without keys when VERCEL_ENV is %j", (VERCEL_ENV) => {
    expect(() => assertMarketApiKeysForProduction({ VERCEL_ENV })).not.toThrow();
  });
});
