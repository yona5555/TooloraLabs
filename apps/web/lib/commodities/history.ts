import type { DailyRate } from "@tooloralabs/tools";

/**
 * Free, keyless history for the commodities tracker (MetalpriceAPI's history is paid, and its
 * 100-requests/month free quota is kept for the daily spot price only):
 * - WTI and Brent: FRED's mirror of the US EIA daily spot closes (public domain), since 1986/1987.
 * - Silver and gold: INSEE's monthly averages of the London spot prices (Etalab open licence),
 *   via DBnomics, since 1990. No free keyless silver OHLC exists, so silver is monthly only.
 * Gold candles come from PAXG/USD on Coinbase/Kraken through the crypto candles route instead.
 */
export type CommodityHistoryId = "wti" | "brent" | "silver" | "gold";

const FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=";
const FRED_IDS = { wti: "DCOILWTICO", brent: "DCOILBRENTEU" } as const;
const DBNOMICS = "https://api.db.nomics.world/v22/series/INSEE/IPPMP-NF/";
const INSEE_IDS = {
  // US cents per troy ounce
  silver: { id: "M.CIMP.46.VALEUR_ABSOLUE.NOUVEAU.ETR.CENT_US.BRUT.0151.SO.SO.FALSE", scale: 0.01 },
  // US dollars per troy ounce (London PM fix monthly average)
  gold: { id: "M.CIMP.56.VALEUR_ABSOLUE.NOUVEAU.ETR.USD.BRUT.0048.SO.SO.FALSE", scale: 1 },
} as const;

/** EIA posts closes with a lag of a few days and INSEE monthly; 12 hours is plenty fresh. */
const REVALIDATE_SECONDS = 43200;

export type CommodityHistory = { points: DailyRate[]; frequency: "daily" | "monthly"; source: "fred" | "insee" };

async function fred(id: string): Promise<DailyRate[]> {
  const res = await fetch(`${FRED}${id}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`FRED ${id} failed: ${res.status}`);
  const text = await res.text();
  // Missing days are "." (holidays); negative closes (WTI, 20 April 2020) are real and kept.
  return text
    .trim()
    .split("\n")
    .slice(1)
    .flatMap((line) => {
      const [date, value] = line.split(",");
      const rate = Number(value);
      return value && value !== "." && Number.isFinite(rate) ? [{ date, rate }] : [];
    });
}

async function insee(id: string, scale: number): Promise<DailyRate[]> {
  const res = await fetch(`${DBNOMICS}${id}?observations=1&format=json`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`DBnomics ${id} failed: ${res.status}`);
  const json = (await res.json()) as { series: { docs: { period: string[]; value: (number | string)[] }[] } };
  const doc = json.series.docs[0];
  return doc.period.flatMap((period, i) => {
    const v = Number(doc.value[i]);
    return Number.isFinite(v) && v > 0 ? [{ date: `${period}-01`, rate: v * scale }] : [];
  });
}

export async function getCommodityHistory(id: CommodityHistoryId): Promise<CommodityHistory> {
  if (id === "wti" || id === "brent") return { points: await fred(FRED_IDS[id]), frequency: "daily", source: "fred" };
  const s = INSEE_IDS[id];
  return { points: await insee(s.id, s.scale), frequency: "monthly", source: "insee" };
}
