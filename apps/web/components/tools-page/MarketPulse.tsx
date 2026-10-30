import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Clock3 } from "lucide-react";
import { buildDailyForecast, currentStep, isNightSymbol, metSymbolCategory, wxCityName, wxFindCity } from "@tooloralabs/tools";
import { Link } from "@/i18n/navigation";
import WeatherIcon from "@/components/tools/weather-forecast/WeatherIcon";
import { getForecast } from "@/lib/weather/met-norway";
import NewYorkClock from "./NewYorkClock";
import Sparkline from "./PulseSparkline";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getTopCoins, getFetchTimestamp } from "@/lib/crypto/coingecko";
import { getCandles } from "@/lib/crypto/candles";
import { getUsdRateTable } from "@/lib/forex/frankfurter";

/**
 * Three compact live indicators beside the /tools title. Every figure comes from a call a tool
 * already makes, with the exact same arguments, so it reads the same Next data-cache entry
 * instead of adding a request to any provider (MetalpriceAPI's 100/month quota is untouched):
 * - Gold: spot from getMetalSnapshot() (commodities-tracker); trend + change from the PAXG/USD
 *   daily candles the tracker's gold chart uses (/api/crypto/candles?symbol=paxg&tf=1D).
 * - Bitcoin: price + 24h change from getTopCoins(100) (crypto-converter); trend from the BTC/USD
 *   daily candles its charts use.
 * - EUR/USD: getUsdRateTable(10) (batch-invoice-calculator), the ECB fixings via Frankfurter.
 * - New York weather: getForecast() at the weather tool's own New York coordinates (MET Norway),
 *   so it shares the tool's cached response; no other provider.
 * - New York time: the browser clock through Intl.DateTimeFormat; no request at all.
 * Each data indicator carries a hover/focus note with its source and the data's own update time.
 * A missing value is never filled in: no price hides the whole indicator, no history hides only
 * its trend line and change.
 */

type Indicator = {
  key: "gold" | "bitcoin" | "eurUsd";
  href: string;
  price: number;
  decimals: number;
  prefix: string;
  change: number | null;
  trend: number[] | null;
  note: string[];
};

const TREND_POINTS = 30;
const NEW_YORK = wxFindCity("new-york");

const CHIP =
  "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 transition hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-500/10";

/** One indicator: a 40px link (the back button's height) plus an optional note shown on hover/focus, never wider than the chip. */
function Chip({ id, href, label, note, children, trailing }: { id: string; href: string; label: string; note?: string[]; children: ReactNode; trailing?: ReactNode }) {
  const noteId = `pulse-note-${id}`;
  return (
    <li className="group relative min-w-0">
      <Link href={href} aria-describedby={note ? noteId : undefined} className={CHIP}>
        <span className="flex min-w-0 flex-col leading-4">
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
            {note && <Clock3 size={10} aria-hidden="true" className="shrink-0 opacity-70" />}
          </span>
          {children}
        </span>
        {trailing}
      </Link>
      {note && (
        <span
          id={noteId}
          role="tooltip"
          className="pointer-events-none absolute inset-x-0 top-full z-30 mt-1 hidden rounded-md border border-zinc-200 bg-white p-2 text-xs leading-4 text-zinc-600 shadow-lg group-focus-within:block group-hover:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {note.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      )}
    </li>
  );
}

export { Sparkline };

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export default async function MarketPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  const now = Math.floor(getFetchTimestamp() / 1000);
  const [metals, coins, paxg, btc, fx, wx] = await Promise.all([
    getMetalSnapshot(),
    settle(getTopCoins(100)),
    settle(getCandles("paxg", "1D", now)),
    settle(getCandles("btc", "1D", now)),
    settle(getUsdRateTable(10)),
    NEW_YORK ? settle(getForecast(NEW_YORK.lat, NEW_YORK.lon)) : Promise.resolve(null),
  ]);
  const dateFmt = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { dateStyle: "medium", timeZone: "UTC" });
  const stampFmt = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const updated = (ms: number) => t("pulseUpdated", { time: `${stampFmt.format(new Date(ms))} UTC` });
  const indicators: Indicator[] = [];

  if (metals && Number.isFinite(metals.goldUsdPerOunce)) {
    const closes = paxg?.candles.map((c) => c.close).slice(-TREND_POINTS) ?? [];
    const ok = closes.length >= 2;
    indicators.push({
      key: "gold",
      href: "/tools/commodities-tracker",
      price: metals.goldUsdPerOunce,
      decimals: 0,
      prefix: "$",
      change: ok ? ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100 : null,
      trend: ok ? closes : null,
      note: [updated(metals.timestamp * 1000), t("pulseGoldNote")],
    });
  }

  const bitcoin = coins?.find((c) => c.id === "bitcoin");
  if (bitcoin && Number.isFinite(bitcoin.currentPrice)) {
    const closes = btc?.candles.map((c) => c.close).slice(-TREND_POINTS) ?? [];
    indicators.push({
      key: "bitcoin",
      href: "/tools/crypto-converter",
      price: bitcoin.currentPrice,
      decimals: 0,
      prefix: "$",
      change: bitcoin.priceChangePercentage24h,
      trend: closes.length >= 2 ? closes : null,
      note: [...(bitcoin.lastUpdated && Number.isFinite(Date.parse(bitcoin.lastUpdated)) ? [updated(Date.parse(bitcoin.lastUpdated))] : []), t("pulseBitcoinNote")],
    });
  }

  if (fx) {
    const eurUsd = fx.dates
      .map((date, i) => ({ date, v: 1 / fx.rates.EUR?.[i] }))
      .filter((p) => Number.isFinite(p.v) && p.v > 0);
    if (eurUsd.length > 0) {
      const last = eurUsd[eurUsd.length - 1];
      const prev = eurUsd[eurUsd.length - 2];
      indicators.push({
        key: "eurUsd",
        href: "/tools/forex-converter",
        price: last.v,
        decimals: 4,
        prefix: "",
        change: prev ? ((last.v - prev.v) / prev.v) * 100 : null,
        trend: eurUsd.length >= 2 ? eurUsd.map((p) => p.v) : null,
        note: [t("pulseUpdated", { time: dateFmt.format(new Date(`${last.date}T00:00:00Z`)) }), t("pulseEurUsdNote")],
      });
    }
  }

  const cityName = NEW_YORK ? wxCityName(NEW_YORK, locale) : "";
  const nowMs = now * 1000;
  const step = wx ? currentStep(wx.forecast.steps, nowMs) : null;
  const today = wx && NEW_YORK ? buildDailyForecast(wx.forecast.steps, NEW_YORK.zone)[0] : undefined;
  const deg = (c: number) => `${new Intl.NumberFormat(`${locale}-u-nu-latn`, { maximumFractionDigits: 0 }).format(Math.round(c) + 0)}°`;

  return (
    <ul aria-label={t("pulseLabel")} className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {indicators.map((ind) => {
        const price = new Intl.NumberFormat(`${locale}-u-nu-latn`, {
          minimumFractionDigits: ind.decimals,
          maximumFractionDigits: ind.decimals,
        }).format(ind.price);
        const up = (ind.change ?? 0) >= 0;
        return (
          <Chip key={ind.key} id={ind.key} href={ind.href} label={t(`pulse_${ind.key}`)} note={ind.note} trailing={ind.trend && <Sparkline points={ind.trend} up={up} />}>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span dir="ltr" className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {ind.prefix}
                {price}
              </span>
              {ind.change !== null && Number.isFinite(ind.change) && (
                <span dir="ltr" className={`text-xs font-medium tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {up ? "+" : ""}
                  {ind.change.toFixed(2)}%
                </span>
              )}
            </span>
          </Chip>
        );
      })}
      {wx && step && NEW_YORK && (
        <Chip
          id="weather"
          href="/tools/weather-forecast"
          label={t("pulse_weather", { city: cityName })}
          note={[updated(wx.forecast.updatedAt), t("pulseWeatherNote")]}
          trailing={<WeatherIcon category={metSymbolCategory(step.symbol)} night={isNightSymbol(step.symbol)} size={20} className="shrink-0 text-amber-500" />}
        >
          <span className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span dir="ltr" className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{deg(step.tempC)}C</span>
            {today && (
              <span dir="ltr" className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                {deg(today.minC)} / {deg(today.maxC)}
              </span>
            )}
          </span>
        </Chip>
      )}
      {NEW_YORK && (
        <Chip id="time" href="/tools/world-time-converter" label={t("pulse_time", { city: cityName })}>
          <NewYorkClock locale={locale} zone={NEW_YORK.zone} />
        </Chip>
      )}
    </ul>
  );
}
