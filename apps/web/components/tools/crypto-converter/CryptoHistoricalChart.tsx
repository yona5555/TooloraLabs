"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  PriceScaleMode,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  CANDLE_TIMEFRAMES,
  candleChangePercent,
  movingAverage,
  periodExtremes,
  type Candle,
  type CandleTimeframe,
  type CryptoCoin,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { useLiveTicks } from "./useCryptoLive";
import { changeColor, useCryptoFormatters, useFiat } from "./cryptoFormat";

const LIST_COUNT = 24;

type CryptoHistoricalChartProps = {
  coin: CryptoCoin | undefined;
  /** The live price list beside the chart; clicking a row charts that coin. */
  coins: CryptoCoin[];
  onSelectCoin: (id: string) => void;
  digitStyle: DigitStyle;
  /** Reports the loaded candles so other indicators (e.g. volatility) reuse them instead of refetching. */
  onCandles?: (candles: Candle[], timeframe: CandleTimeframe) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; key: string }
  | { status: "ready"; key: string; candles: Candle[]; source: string; pair: string };

const UP = "#10b981";
const DOWN = "#ef4444";
const MA20_COLOR = "#f59e0b";
const MA50_COLOR = "#8b5cf6";
const CHART_HEIGHT = 380;

export default function CryptoHistoricalChart({ coin, coins, onSelectCoin, digitStyle, onCandles }: CryptoHistoricalChartProps) {
  const t = useTranslations("tools.crypto-converter.chart");
  const tTicker = useTranslations("tools.crypto-converter.ticker");
  const fiat = useFiat();
  const f = useCryptoFormatters(digitStyle);
  const listCoins = coins.slice(0, LIST_COUNT);
  const ticks = useLiveTicks(listCoins.map((c) => c.symbol));
  const locale = useLocale();
  const isDark = useIsDarkMode();
  const symbol = coin?.symbol ?? "btc";
  const [timeframe, setTimeframe] = useState<CandleTimeframe>("1D");
  const [loaded, setLoaded] = useState<LoadState>({ status: "loading" });
  const [showMa20, setShowMa20] = useState(true);
  const [showMa50, setShowMa50] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50Ref = useRef<ISeriesApi<"Line"> | null>(null);

  // A result only counts for the request it answered; anything else reads as "loading".
  const requestKey = `${symbol}|${timeframe}|${retry}`;
  const state: LoadState = useMemo(
    () => ("key" in loaded && loaded.key === requestKey ? loaded : { status: "loading" }),
    [loaded, requestKey]
  );

  useEffect(() => {
    let cancelled = false;
    const key = `${symbol}|${timeframe}|${retry}`;
    fetch(`/api/crypto/candles?symbol=${encodeURIComponent(symbol)}&tf=${timeframe}`)
      .then(async (res) => {
        const json = (await res.json()) as { candles?: Candle[]; source?: string; pair?: string };
        if (cancelled) return;
        if (!res.ok || !json.candles?.length) setLoaded({ status: "error", key });
        else setLoaded({ status: "ready", key, candles: json.candles, source: json.source ?? "", pair: json.pair ?? "" });
      })
      .catch(() => !cancelled && setLoaded({ status: "error", key }));
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, retry]);

  const candles = useMemo(() => (state.status === "ready" ? state.candles : []), [state]);
  const ma20 = useMemo(() => movingAverage(candles, 20), [candles]);
  const ma50 = useMemo(() => movingAverage(candles, 50), [candles]);
  const extremes = useMemo(() => periodExtremes(candles), [candles]);

  useEffect(() => {
    if (candles.length) onCandles?.(candles, timeframe);
  }, [candles, timeframe, onCandles]);

  // Build (or rebuild) the chart whenever data or theme changes; toggles only flip visibility below.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || candles.length === 0) return;
    const text = isDark ? "#a1a1aa" : "#52525b";
    const grid = isDark ? "#27272a" : "#f4f4f5";
    const intraday = ["10m", "15m", "30m", "1h", "4h", "6h"].includes(timeframe);
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: isDark ? "#18181b" : "#ffffff" }, textColor: text, attributionLogo: true },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      // Log scale for multi-year candles: a linear axis would waste most of its height (and dip below zero).
      rightPriceScale: { borderColor: grid, mode: timeframe === "1M" || timeframe === "1Y" ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal },
      timeScale: { borderColor: grid, timeVisible: intraday, secondsVisible: false },
      localization: {
        locale,
        // Candles are USD pairs; the axis reads in the display currency at today's rate.
        priceFormatter: (p: number) => formatLocalizedNumber(p * fiat.perUsd, digitStyle, { maximumFractionDigits: p * fiat.perUsd < 1 ? 6 : 2 }),
      },
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
    });
    candleSeries.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.26 } });
    candleSeries.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close })));

    const volume = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "", lastValueVisible: false, priceLineVisible: false });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volume.setData(
      candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.volume, color: c.close >= c.open ? `${UP}66` : `${DOWN}66` }))
    );

    const lineData = (values: (number | null)[]) =>
      candles.flatMap((c, i) => (values[i] === null ? [] : [{ time: c.time as UTCTimestamp, value: values[i] as number }]));
    const lineOpts = { lineWidth: 2 as const, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false };
    ma20Ref.current = chart.addSeries(LineSeries, { ...lineOpts, color: MA20_COLOR });
    ma20Ref.current.setData(lineData(ma20));
    ma50Ref.current = chart.addSeries(LineSeries, { ...lineOpts, color: MA50_COLOR });
    ma50Ref.current.setData(lineData(ma50));

    if (extremes) {
      candleSeries.createPriceLine({ price: extremes.high, color: UP, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: true, title: t("highLabel") });
      candleSeries.createPriceLine({ price: extremes.low, color: DOWN, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: true, title: t("lowLabel") });
      const markers = [
        { time: extremes.highTime as UTCTimestamp, position: "aboveBar" as const, color: UP, shape: "arrowDown" as const },
        { time: extremes.lowTime as UTCTimestamp, position: "belowBar" as const, color: DOWN, shape: "arrowUp" as const },
      ].sort((a, b) => a.time - b.time);
      createSeriesMarkers(candleSeries, markers);
    }

    const indexByTime = new Map(candles.map((c, i) => [c.time, i]));
    chart.subscribeCrosshairMove((param) => {
      const idx = param.time === undefined ? undefined : indexByTime.get(param.time as number);
      setHoverIndex(idx ?? null);
    });
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      ma20Ref.current = null;
      ma50Ref.current = null;
    };
  }, [candles, isDark, locale, digitStyle, extremes, ma20, ma50, timeframe, t, fiat.perUsd]);

  useEffect(() => {
    ma20Ref.current?.applyOptions({ visible: showMa20 });
    ma50Ref.current?.applyOptions({ visible: showMa50 });
  }, [showMa20, showMa50, candles, isDark]);

  const shownIndex = hoverIndex !== null && hoverIndex < candles.length ? hoverIndex : candles.length - 1;
  const shown = candles[shownIndex];
  const usd = f.money;
  const num = (v: number, max = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const intraday = ["10m", "15m", "30m", "1h", "4h", "6h"].includes(timeframe);
  const dateLabel = (time: number) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      year: intraday ? undefined : "numeric",
      month: timeframe === "1Y" ? undefined : "short",
      day: timeframe === "1M" || timeframe === "1Y" ? undefined : "numeric",
      hour: intraday ? "2-digit" : undefined,
      minute: intraday ? "2-digit" : undefined,
    }).format(new Date(time * 1000));
  const change = shown ? candleChangePercent(shown) : 0;
  const coinSymbol = symbol.toUpperCase();

  return (
    <SectionCard id="chart" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {t("heading", { coin: coin?.name ?? coinSymbol, currency: fiat.code })}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Live price list: on desktop it fills the chart column's height and scrolls; on mobile it sits above the chart. */}
      <div className="relative min-h-0">
        <div className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-zinc-200 lg:absolute lg:inset-0 lg:max-h-none dark:border-zinc-800">
          <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{tTicker("title")}</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {tTicker("live")}
            </span>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800" data-testid="sidebar-ticker">
            {listCoins.map((c) => {
              const tick = ticks[c.symbol.toUpperCase()];
              const price = tick?.price ?? c.currentPrice;
              const flash = tick?.direction === "up" ? "animate-flash-up" : tick?.direction === "down" ? "animate-flash-down" : "";
              const active = c.id === coin?.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    data-coin={c.id}
                    aria-pressed={active}
                    onClick={() => onSelectCoin(c.id)}
                    className={`flex w-full items-center gap-2 border-s-2 px-3 py-2 text-start transition ${
                      active ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" width={18} height={18} className="shrink-0 rounded-full" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                      <span dir="ltr" className="block text-[10px] uppercase text-zinc-400">{c.symbol}</span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span key={tick?.at ?? 0} dir="ltr" className={`rounded px-1 font-mono text-xs text-zinc-900 dark:text-zinc-100 ${flash}`}>{f.money(price)}</span>
                      <span dir="ltr" className={`font-mono text-[10px] ${changeColor(c.priceChangePercentage24h)}`}>
                        {c.priceChangePercentage24h == null ? "—" : f.signedPct(c.priceChangePercentage24h, 1)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">{tTicker("note")}</p>
        </div>
      </div>

      <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t("timeframeLabel")} className="flex flex-wrap gap-1.5">
          {CANDLE_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              data-tf={tf}
              aria-pressed={timeframe === tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                timeframe === tf
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {t(`tf.${tf}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[
            { on: showMa20, set: setShowMa20, label: "MA 20", color: MA20_COLOR },
            { on: showMa50, set: setShowMa50, label: "MA 50", color: MA50_COLOR },
          ].map((m) => (
            <button
              key={m.label}
              type="button"
              aria-pressed={m.on}
              onClick={() => m.set(!m.on)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                m.on ? "border-zinc-400 text-zinc-800 dark:border-zinc-500 dark:text-zinc-100" : "border-zinc-200 text-zinc-400 dark:border-zinc-800"
              }`}
            >
              <span className="h-0.5 w-4 rounded" style={{ backgroundColor: m.on ? m.color : "#a1a1aa" }} />
              <span dir="ltr">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative min-w-0 lg:flex-1" dir="ltr" style={{ height: CHART_HEIGHT }}>
          {state.status === "ready" && <div ref={containerRef} data-testid="candle-chart" className="absolute inset-0" />}
          {state.status === "ready" && shown && (
            <div
              data-testid="candle-tooltip"
              className="pointer-events-none absolute start-2 top-2 z-10 rounded-lg bg-white/90 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-zinc-700 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-200 dark:ring-zinc-700"
            >
              <div className="font-sans font-semibold">{dateLabel(shown.time)}</div>
              <div>
                O {usd(shown.open)} H {usd(shown.high)}
              </div>
              <div>
                L {usd(shown.low)} C {usd(shown.close)}
              </div>
              <div>
                <span className={change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                  {change >= 0 ? "+" : ""}
                  {num(change)}%
                </span>{" "}
                · Vol {num(shown.volume, shown.volume < 10 ? 4 : 0)} {coinSymbol}
              </div>
            </div>
          )}
          {state.status === "loading" && (
            <div className="flex h-full animate-pulse items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-800/40">
              {t("loading")}
            </div>
          )}
          {state.status === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-zinc-50 px-6 text-center dark:bg-zinc-800/40">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("error", { symbol: coinSymbol })}</p>
              <button
                type="button"
                onClick={() => setRetry((r) => r + 1)}
                className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400"
              >
                {t("retry")}
              </button>
            </div>
          )}
        </div>

        <div className="lg:w-60">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={
              shown
                ? [
                    { label: t("rowCandle"), value: dateLabel(shown.time) },
                    { label: t("rowOpen"), value: usd(shown.open) },
                    { label: t("rowClose"), value: usd(shown.close) },
                    { label: t("rowChange"), value: `${change >= 0 ? "+" : ""}${num(change)}%`, note: t("rowChangeNote") },
                    { label: t("rowRange"), value: usd(shown.high - shown.low) },
                    { label: "MA 20", value: ma20[shownIndex] != null ? usd(ma20[shownIndex] as number) : "—" },
                    { label: "MA 50", value: ma50[shownIndex] != null ? usd(ma50[shownIndex] as number) : "—" },
                    ...(extremes
                      ? [
                          { label: t("highLabel"), value: usd(extremes.high) },
                          { label: t("lowLabel"), value: usd(extremes.low), emphasize: true, note: t("periodNote", { count: candles.length }) },
                        ]
                      : []),
                  ]
                : [{ label: t("rowCandle"), value: "—" }]
            }
          />
        </div>
      </div>
      </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        {state.status === "ready" && t("source", { source: state.source === "kraken" ? "Kraken" : "Coinbase Exchange", pair: state.pair })}{" "}
        {t("attribution")}{" "}
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline">
          TradingView
        </a>
      </p>
    </SectionCard>
  );
}
