"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  AreaSeries,
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
import { candleChangePercent, movingAverage, periodExtremes, type Candle } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { useFullscreen } from "./useFullscreen";
import { changeColor } from "./fiat";

export type ChartTimeframe = { id: string; label: string };

export type MarketChartState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      candles: Candle[];
      /** "line" draws closes only — used where the source has no real open/high/low (e.g. daily ECB fixings). */
      mode: "candles" | "line";
    };

type MarketChartProps = {
  timeframes: ChartTimeframe[];
  timeframe: string;
  onTimeframe: (id: string) => void;
  state: MarketChartState;
  onRetry: () => void;
  /** Log axis for multi-year views, where a linear axis wastes most of its height. */
  logScale?: boolean;
  /** Shows the time of day on the axis and tooltip. */
  intraday?: boolean;
  /** Axis/tooltip price in the display currency (input is the series' own value). */
  formatPrice: (value: number) => string;
  formatPercent: (value: number) => string;
  formatDate: (time: number) => string;
  /** Volume line for the tooltip; omitted when the series has no volume. */
  formatVolume?: (candle: Candle) => string;
  labels: { timeframe: string; high: string; low: string; fullscreen: string; exitFullscreen: string; loading: string; retry: string; close?: string };
};

const UP = "#10b981";
const DOWN = "#ef4444";
const LINE = "#2563eb";
const MA20_COLOR = "#f59e0b";
const MA50_COLOR = "#8b5cf6";
const CHART_HEIGHT = 460;

/**
 * The chart half of a market terminal card (crypto, forex, commodities): timeframe buttons, MA 20/50
 * toggles, period high/low lines, an OHLC hover readout and a fullscreen mode. Data loading stays
 * with the caller so each tool can use its own source.
 */
export default function MarketChart({
  timeframes,
  timeframe,
  onTimeframe,
  state,
  onRetry,
  logScale = false,
  intraday = false,
  formatPrice,
  formatPercent,
  formatDate,
  formatVolume,
  labels,
}: MarketChartProps) {
  const locale = useLocale();
  const isDark = useIsDarkMode();
  const [showMa20, setShowMa20] = useState(true);
  const [showMa50, setShowMa50] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { ref: fullscreenRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50Ref = useRef<ISeriesApi<"Line"> | null>(null);

  const candles = useMemo(() => (state.status === "ready" ? state.candles : []), [state]);
  const mode = state.status === "ready" ? state.mode : "candles";
  const hasVolume = useMemo(() => Boolean(formatVolume) && candles.some((c) => c.volume > 0), [candles, formatVolume]);
  const ma20 = useMemo(() => movingAverage(candles, 20), [candles]);
  const ma50 = useMemo(() => movingAverage(candles, 50), [candles]);
  const extremes = useMemo(() => periodExtremes(candles), [candles]);

  // Build (or rebuild) the chart whenever data or theme changes; toggles only flip visibility below.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || candles.length === 0) return;
    const text = isDark ? "#a1a1aa" : "#52525b";
    const grid = isDark ? "#27272a" : "#f4f4f5";
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: isDark ? "#18181b" : "#ffffff" }, textColor: text, attributionLogo: true },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: grid, mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal },
      timeScale: { borderColor: grid, timeVisible: intraday, secondsVisible: false },
      localization: { locale, priceFormatter: formatPrice },
    });
    chartRef.current = chart;

    const margins = { top: 0.08, bottom: hasVolume ? 0.26 : 0.08 };
    const main =
      mode === "candles"
        ? chart.addSeries(CandlestickSeries, { upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, borderVisible: false })
        : chart.addSeries(AreaSeries, { lineColor: LINE, topColor: `${LINE}33`, bottomColor: `${LINE}00`, lineWidth: 2 });
    main.priceScale().applyOptions({ scaleMargins: margins });
    if (mode === "candles") {
      (main as ISeriesApi<"Candlestick">).setData(
        candles.map((c) => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }))
      );
    } else {
      (main as ISeriesApi<"Area">).setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })));
    }

    if (hasVolume) {
      const volume = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "", lastValueVisible: false, priceLineVisible: false });
      volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      volume.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.volume, color: c.close >= c.open ? `${UP}66` : `${DOWN}66` })));
    }

    const lineData = (values: (number | null)[]) =>
      candles.flatMap((c, i) => (values[i] === null ? [] : [{ time: c.time as UTCTimestamp, value: values[i] as number }]));
    const lineOpts = { lineWidth: 2 as const, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false };
    ma20Ref.current = chart.addSeries(LineSeries, { ...lineOpts, color: MA20_COLOR });
    ma20Ref.current.setData(lineData(ma20));
    ma50Ref.current = chart.addSeries(LineSeries, { ...lineOpts, color: MA50_COLOR });
    ma50Ref.current.setData(lineData(ma50));

    if (extremes) {
      main.createPriceLine({ price: extremes.high, color: UP, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: true, title: labels.high });
      main.createPriceLine({ price: extremes.low, color: DOWN, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: true, title: labels.low });
      const markers = [
        { time: extremes.highTime as UTCTimestamp, position: "aboveBar" as const, color: UP, shape: "arrowDown" as const },
        { time: extremes.lowTime as UTCTimestamp, position: "belowBar" as const, color: DOWN, shape: "arrowUp" as const },
      ].sort((a, b) => a.time - b.time);
      createSeriesMarkers(main, markers);
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
  }, [candles, mode, hasVolume, isDark, locale, extremes, ma20, ma50, logScale, intraday, formatPrice, labels.high, labels.low]);

  useEffect(() => {
    ma20Ref.current?.applyOptions({ visible: showMa20 });
    ma50Ref.current?.applyOptions({ visible: showMa50 });
  }, [showMa20, showMa50, candles, isDark]);

  const shownIndex = hoverIndex !== null && hoverIndex < candles.length ? hoverIndex : candles.length - 1;
  const shown = candles[shownIndex];
  // In line mode the change is close-to-close, since a single fixing has no open of its own.
  const prev = candles[shownIndex - 1];
  const change = shown ? (mode === "candles" ? candleChangePercent(shown) : prev ? ((shown.close - prev.close) / prev.close) * 100 : 0) : 0;

  return (
    <div
      ref={fullscreenRef}
      data-testid="chart-fullscreen-box"
      className={isFullscreen ? "flex h-full flex-col overflow-auto bg-white p-4 dark:bg-zinc-900" : "mt-4"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={labels.timeframe} className="flex flex-wrap gap-1.5">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              type="button"
              data-tf={tf.id}
              aria-pressed={timeframe === tf.id}
              onClick={() => onTimeframe(tf.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                timeframe === tf.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {tf.label}
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
          <button
            type="button"
            data-testid="chart-fullscreen"
            aria-pressed={isFullscreen}
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
            {isFullscreen ? labels.exitFullscreen : labels.fullscreen}
          </button>
        </div>
      </div>

      <div className={`relative mt-4 min-w-0 ${isFullscreen ? "flex-1" : ""}`} dir="ltr" style={isFullscreen ? undefined : { height: CHART_HEIGHT }}>
        {state.status === "ready" && <div ref={containerRef} data-testid="candle-chart" data-mode={mode} className="absolute inset-0" />}
        {state.status === "ready" && shown && (
          <div
            data-testid="candle-tooltip"
            className="pointer-events-none absolute start-2 top-2 z-10 rounded-lg bg-white/90 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-zinc-700 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-200 dark:ring-zinc-700"
          >
            <div className="font-sans font-semibold">{formatDate(shown.time)}</div>
            {mode === "candles" ? (
              <>
                <div>
                  O {formatPrice(shown.open)} H {formatPrice(shown.high)}
                </div>
                <div>
                  L {formatPrice(shown.low)} C {formatPrice(shown.close)}
                </div>
              </>
            ) : (
              <div>
                {labels.close ?? "C"} {formatPrice(shown.close)}
              </div>
            )}
            <div>
              <span className={changeColor(change)}>{formatPercent(change)}</span>
              {hasVolume && formatVolume && <> · {formatVolume(shown)}</>}
            </div>
          </div>
        )}
        {state.status === "loading" && (
          <div className="flex h-full animate-pulse items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-800/40">{labels.loading}</div>
        )}
        {state.status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-zinc-50 px-6 text-center dark:bg-zinc-800/40">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{state.message}</p>
            <button type="button" onClick={onRetry} className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
              {labels.retry}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
