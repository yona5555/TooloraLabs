"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { CANDLE_TIMEFRAMES, type Candle, type CandleTimeframe, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import MarketChart, { type MarketChartState } from "@/components/tools/markets/MarketChart";
import InstrumentList, { LiveBadge } from "@/components/tools/markets/InstrumentList";
import { useLiveTicks } from "./useCryptoLive";
import { useCryptoFormatters, useFiat } from "./cryptoFormat";

const LIST_COUNT = 24;
const INTRADAY: CandleTimeframe[] = ["10m", "15m", "30m", "1h", "4h", "6h"];

type CryptoHistoricalChartProps = {
  coin: CryptoCoin | undefined;
  /** The live price list under the chart; clicking a row charts that coin. */
  coins: CryptoCoin[];
  onSelectCoin: (id: string) => void;
  digitStyle: DigitStyle;
};

type LoadState = { key: string; status: "error" } | { key: string; status: "ready"; candles: Candle[]; source: string; pair: string };

export default function CryptoHistoricalChart({ coin, coins, onSelectCoin, digitStyle }: CryptoHistoricalChartProps) {
  const t = useTranslations("tools.crypto-converter.chart");
  const tTicker = useTranslations("tools.crypto-converter.ticker");
  const fiat = useFiat();
  const f = useCryptoFormatters(digitStyle);
  const listCoins = coins.slice(0, LIST_COUNT);
  const ticks = useLiveTicks(listCoins.map((c) => c.symbol));
  const locale = useLocale();
  const symbol = coin?.symbol ?? "btc";
  const [timeframe, setTimeframe] = useState<CandleTimeframe>("1D");
  const [loaded, setLoaded] = useState<LoadState | null>(null);
  const [retry, setRetry] = useState(0);

  // A result only counts for the request it answered; anything else reads as "loading".
  const requestKey = `${symbol}|${timeframe}|${retry}`;
  useEffect(() => {
    let cancelled = false;
    const key = `${symbol}|${timeframe}|${retry}`;
    fetch(`/api/crypto/candles?symbol=${encodeURIComponent(symbol)}&tf=${timeframe}`)
      .then(async (res) => {
        const json = (await res.json()) as { candles?: Candle[]; source?: string; pair?: string };
        if (cancelled) return;
        if (!res.ok || !json.candles?.length) setLoaded({ key, status: "error" });
        else setLoaded({ key, status: "ready", candles: json.candles, source: json.source ?? "", pair: json.pair ?? "" });
      })
      .catch(() => !cancelled && setLoaded({ key, status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, retry]);

  const current = loaded?.key === requestKey ? loaded : null;
  const coinSymbol = symbol.toUpperCase();
  const state: MarketChartState = useMemo(
    () =>
      !current
        ? { status: "loading" }
        : current.status === "error"
          ? { status: "error", message: t("error", { symbol: coinSymbol }) }
          : { status: "ready", candles: current.candles, mode: "candles" },
    [current, t, coinSymbol]
  );

  const intraday = INTRADAY.includes(timeframe);
  // Candles are USD pairs; the axis reads in the display currency at today's rate.
  const formatPrice = useCallback(
    (p: number) => formatLocalizedNumber(p * fiat.perUsd, digitStyle, { maximumFractionDigits: p * fiat.perUsd < 1 ? 6 : 2 }),
    [fiat.perUsd, digitStyle]
  );
  const formatPercent = useCallback((v: number) => `${v >= 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 2 })}%`, [digitStyle]);
  const formatDate = useCallback(
    (time: number) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        year: intraday ? undefined : "numeric",
        month: timeframe === "1Y" ? undefined : "short",
        day: timeframe === "1M" || timeframe === "1Y" ? undefined : "numeric",
        hour: intraday ? "2-digit" : undefined,
        minute: intraday ? "2-digit" : undefined,
      }).format(new Date(time * 1000)),
    [locale, intraday, timeframe]
  );
  const formatVolume = useCallback(
    (c: Candle) => `Vol ${formatLocalizedNumber(c.volume, digitStyle, { maximumFractionDigits: c.volume < 10 ? 4 : 0 })} ${coinSymbol}`,
    [digitStyle, coinSymbol]
  );
  const labels = useMemo(
    () => ({
      timeframe: t("timeframeLabel"),
      high: t("highLabel"),
      low: t("lowLabel"),
      fullscreen: t("fullscreen"),
      exitFullscreen: t("exitFullscreen"),
      loading: t("loading"),
      retry: t("retry"),
    }),
    [t]
  );

  const rows = listCoins.map((c) => {
    const tick = ticks[c.symbol.toUpperCase()];
    return {
      id: c.id,
      name: c.name,
      sub: c.symbol,
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src={c.image} alt="" width={18} height={18} className="shrink-0 rounded-full" />,
      price: f.money(tick?.price ?? c.currentPrice),
      change: c.priceChangePercentage24h,
      changeText: c.priceChangePercentage24h == null ? "—" : f.signedPct(c.priceChangePercentage24h, 1),
      flash: tick?.direction ?? null,
      flashKey: tick?.at,
    };
  });

  return (
    <SectionCard id="chart" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { coin: coin?.name ?? coinSymbol, currency: fiat.code })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <MarketChart
        timeframes={CANDLE_TIMEFRAMES.map((tf) => ({ id: tf, label: t(`tf.${tf}`) }))}
        timeframe={timeframe}
        onTimeframe={(id) => setTimeframe(id as CandleTimeframe)}
        state={state}
        onRetry={() => setRetry((r) => r + 1)}
        logScale={timeframe === "1M" || timeframe === "1Y"}
        intraday={intraday}
        formatPrice={formatPrice}
        formatPercent={formatPercent}
        formatDate={formatDate}
        formatVolume={formatVolume}
        labels={labels}
      />

      <InstrumentList
        title={tTicker("title")}
        badge={<LiveBadge label={tTicker("live")} />}
        rows={rows}
        activeId={coin?.id}
        onSelect={onSelectCoin}
        note={tTicker("note")}
        rowAttr="data-coin"
      />

      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        {current?.status === "ready" && t("source", { source: current.source === "kraken" ? "Kraken" : "Coinbase Exchange", pair: current.pair })}{" "}
        {t("attribution")}{" "}
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline">
          TradingView
        </a>
      </p>
    </SectionCard>
  );
}
