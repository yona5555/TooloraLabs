import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";
import { Sparkline } from "@/components/tools-page/MarketPulse";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getTopCoins, getFetchTimestamp } from "@/lib/crypto/coingecko";
import { getCandles } from "@/lib/crypto/candles";
import { getUsdRateTable } from "@/lib/forex/frankfurter";

/**
 * The markets section's indicators. Every figure reuses a call the section's tools (and the /tools
 * strip) already make with the same arguments, so it reads the shared Next data cache and adds no
 * request to any provider:
 * - Gold and silver spot: getMetalSnapshot() (commodities-tracker). Gold's change and trend are the
 *   PAXG/USD daily closes its chart uses; silver has no cached history, so it shows the spot only.
 * - Bitcoin and Ethereum: price + 24h change from getTopCoins(100) (crypto-converter); bitcoin's
 *   trend from the BTC/USD daily candles /tools already reads. No ETH candles are cached, so none.
 * - EUR/USD: getUsdRateTable(10), the ECB fixings via Frankfurter.
 * A missing value hides its indicator; it is never filled in.
 */

const TREND_POINTS = 30;

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export default async function MarketsPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  const tp = await getTranslations({ locale, namespace: "categoryPulse" });
  const now = Math.floor(getFetchTimestamp() / 1000);
  const [metals, coins, paxg, btc, fx] = await Promise.all([
    settle(getMetalSnapshot()),
    settle(getTopCoins(100)),
    settle(getCandles("paxg", "1D", now)),
    settle(getCandles("btc", "1D", now)),
    settle(getUsdRateTable(10)),
  ]);

  const num = (v: number, d: number) =>
    new Intl.NumberFormat(`${locale}-u-nu-latn`, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const stampFmt = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const dateFmt = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { dateStyle: "medium", timeZone: "UTC" });
  const updated = (ms: number) => t("pulseUpdated", { time: `${stampFmt.format(new Date(ms))} UTC` });

  const value = (text: string, change: number | null) => {
    const up = (change ?? 0) >= 0;
    return (
      <span className="flex items-baseline gap-1.5">
        <span dir="ltr">{text}</span>
        {change !== null && Number.isFinite(change) && (
          <span dir="ltr" className={`text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {up ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        )}
      </span>
    );
  };
  const lastChange = (closes: number[]) =>
    closes.length >= 2 ? ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100 : null;

  const items: IndicatorItem[] = [];

  if (metals && Number.isFinite(metals.goldUsdPerOunce)) {
    const closes = paxg?.candles.map((c) => c.close).slice(-TREND_POINTS) ?? [];
    const change = lastChange(closes);
    items.push({
      id: "gold",
      href: "/tools/commodities-tracker",
      label: t("pulse_gold"),
      value: value(`$${num(metals.goldUsdPerOunce, 0)}`, change),
      trailing: closes.length >= 2 ? <Sparkline points={closes} up={(change ?? 0) >= 0} /> : undefined,
      note: `${updated(metals.timestamp * 1000)} · ${t("pulseGoldNote")}`,
    });
  }

  if (metals && Number.isFinite(metals.silverUsdPerOunce)) {
    items.push({
      id: "silver",
      href: "/tools/commodities-tracker",
      label: tp("markets.silver"),
      value: value(`$${num(metals.silverUsdPerOunce, 2)}`, null),
      note: `${updated(metals.timestamp * 1000)} · ${tp("markets.silverNote")}`,
    });
  }

  const coinItem = (id: string, label: string, note: string, trend: number[] | null) => {
    const coin = coins?.find((c) => c.id === id);
    if (!coin || !Number.isFinite(coin.currentPrice)) return;
    const stamp = coin.lastUpdated && Number.isFinite(Date.parse(coin.lastUpdated)) ? `${updated(Date.parse(coin.lastUpdated))} · ` : "";
    items.push({
      id,
      href: "/tools/crypto-converter",
      label,
      value: value(`$${num(coin.currentPrice, 0)}`, coin.priceChangePercentage24h),
      trailing: trend ? <Sparkline points={trend} up={(coin.priceChangePercentage24h ?? 0) >= 0} /> : undefined,
      note: `${stamp}${note}`,
    });
  };
  const btcCloses = btc?.candles.map((c) => c.close).slice(-TREND_POINTS) ?? [];
  coinItem("bitcoin", t("pulse_bitcoin"), t("pulseBitcoinNote"), btcCloses.length >= 2 ? btcCloses : null);
  coinItem("ethereum", tp("markets.ethereum"), tp("markets.ethereumNote"), null);

  if (fx) {
    const eurUsd = fx.dates.map((date, i) => ({ date, v: 1 / fx.rates.EUR?.[i] })).filter((p) => Number.isFinite(p.v) && p.v > 0);
    if (eurUsd.length > 0) {
      const series = eurUsd.map((p) => p.v);
      const change = lastChange(series);
      const last = eurUsd[eurUsd.length - 1];
      items.push({
        id: "eurUsd",
        href: "/tools/forex-converter",
        label: t("pulse_eurUsd"),
        value: value(num(last.v, 4), change),
        trailing: series.length >= 2 ? <Sparkline points={series} up={(change ?? 0) >= 0} /> : undefined,
        note: `${t("pulseUpdated", { time: dateFmt.format(new Date(`${last.date}T00:00:00Z`)) })} · ${t("pulseEurUsdNote")}`,
      });
    }
  }

  if (items.length === 0) return null;
  return <IndicatorStrip label={t("pulseLabel")} items={items} />;
}
