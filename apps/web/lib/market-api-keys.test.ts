// Missing key vs configured key for every paid market-data API. The shared setup fails any test that
// writes console.error/console.warn, so "no error log" on the missing-key path is checked by every test.
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getOilSnapshot } from "@/lib/commodities/oilprice";
import { getForexSnapshot } from "@/lib/forex/exchangerate";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe.each([
  { name: "metal", key: "METALPRICE_API_KEY", get: getMetalSnapshot },
  { name: "oil", key: "OILPRICE_API_KEY", get: getOilSnapshot },
  { name: "forex", key: "EXCHANGE_RATE_API_KEY", get: getForexSnapshot },
])("$name snapshot without $key", ({ key, get }) => {
  it.each(["", undefined])("returns null with no request and no log (key %j)", async (value) => {
    vi.stubEnv(key, value);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await get()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("with the key configured (production)", () => {
  it("metal: one request carrying the key, provider values returned unchanged", async () => {
    vi.stubEnv("METALPRICE_API_KEY", "test-key");
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json({ success: true, timestamp: 1_790_000_000, rates: { USDXAU: 2650.5, USDXAG: 31.25 } }));
    vi.stubGlobal("fetch", fetch);
    expect(await getMetalSnapshot()).toEqual({ goldUsdPerOunce: 2650.5, silverUsdPerOunce: 31.25, timestamp: 1_790_000_000 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(fetch.mock.calls[0][0])).toContain("api_key=test-key");
  });

  it("oil: WTI and Brent requests authorised with the key", async () => {
    vi.stubEnv("OILPRICE_API_KEY", "test-key");
    const fetch = vi.fn<typeof globalThis.fetch>(async (url) =>
      json({ status: "success", data: { price: String(url).includes("WTI") ? 70.1 : 74.2, currency: "USD", code: "x", unit: "barrel", as_of: "2026-10-20T12:00:00Z" } }),
    );
    vi.stubGlobal("fetch", fetch);
    expect(await getOilSnapshot()).toEqual({ wtiUsdPerBarrel: 70.1, brentUsdPerBarrel: 74.2, timestamp: 1_792_497_600 });
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const call of fetch.mock.calls) expect(call[1]).toMatchObject({ headers: { Authorization: "Token test-key" } });
  });

  it("forex: rates and currency names requested with the key", async () => {
    vi.stubEnv("EXCHANGE_RATE_API_KEY", "test-key");
    const fetch = vi.fn<typeof globalThis.fetch>(async (url) =>
      String(url).endsWith("/codes")
        ? json({ supported_codes: [["EUR", "Euro"]] })
        : json({ time_last_update_unix: 1, time_next_update_unix: 2, conversion_rates: { EUR: 0.92, XYZ: 3 } }),
    );
    vi.stubGlobal("fetch", fetch);
    expect(await getForexSnapshot()).toEqual({
      currencies: [{ code: "EUR", name: "Euro", ratePerUsd: 0.92 }, { code: "XYZ", name: "XYZ", ratePerUsd: 3 }],
      lastUpdatedUnix: 1,
      nextUpdateUnix: 2,
    });
    for (const call of fetch.mock.calls) expect(String(call[0])).toContain("/test-key/");
  });
});
