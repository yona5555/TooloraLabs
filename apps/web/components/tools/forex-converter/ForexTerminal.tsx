"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { crossSeries, dailyToCandles, dailyToLine, type UsdRateTable } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import MarketChart, { type MarketChartState } from "@/components/tools/markets/MarketChart";
import InstrumentList, { type InstrumentRow } from "@/components/tools/markets/InstrumentList";
import { useMarketFormatters } from "@/components/tools/markets/fiat";
import { hasEcbHistory } from "@/lib/forex/ecb";
import DataSourceNote from "./DataSourceNote";
import { usePairHistory, type Loaded } from "./useForexData";

export const TERMINAL_PAIRS: [string, string][] = [
  ["EUR", "USD"], ["GBP", "USD"], ["USD", "JPY"], ["USD", "CHF"], ["AUD", "USD"], ["USD", "CAD"],
  ["NZD", "USD"], ["EUR", "GBP"], ["EUR", "JPY"], ["GBP", "JPY"], ["EUR", "CHF"], ["AUD", "JPY"],
  ["USD", "CNY"], ["USD", "HKD"], ["USD", "SGD"], ["USD", "INR"], ["USD", "KRW"], ["USD", "TRY"],
  ["USD", "MXN"], ["USD", "BRL"], ["USD", "ZAR"], ["USD", "SEK"], ["USD", "NOK"], ["USD", "PLN"],
];

type Timeframe = "D" | "W" | "M";
const TIMEFRAMES: Timeframe[] = ["D", "W", "M"];
/** The daily line shows the last two years; weekly and monthly candles cover everything since 1999. */
const DAILY_POINTS = 520;

type Props = {
  pair: [string, string];
  onSelectPair: (pair: [string, string]) => void;
  /** The converter's own pair, listed first when the ECB fixes both currencies. */
  converterPair: [string, string];
  recent: Loaded<UsdRateTable>;
  digitStyle: DigitStyle;
};

const pairId = ([b, q]: [string, string]) => `${b}/${q}`;

export default function ForexTerminal({ pair, onSelectPair, converterPair, recent, digitStyle }: Props) {
  const t = useTranslations("tools.forex-converter.chart");
  const locale = useLocale();
  const f = useMarketFormatters(digitStyle);
  const [timeframe, setTimeframe] = useState<Timeframe>("W");
  const [retry, setRetry] = useState(0);
  const [base, quote] = pair;
  const history = usePairHistory(base, quote, retry);

  const state: MarketChartState = useMemo(() => {
    if (history.status === "loading") return { status: "loading" };
    if (history.status !== "ready") return { status: "error", message: t("error", { pair: `${base}/${quote}` }) };
    const points = history.data;
    if (timeframe === "D") return { status: "ready", mode: "line", candles: dailyToLine(points.slice(-DAILY_POINTS)) };
    return { status: "ready", mode: "candles", candles: dailyToCandles(points, timeframe === "W" ? "week" : "month") };
  }, [history, timeframe, t, base, quote]);

  const formatPrice = useCallback((p: number) => formatLocalizedNumber(p, digitStyle, { maximumFractionDigits: p < 0.01 ? 8 : p < 10 ? 5 : 3 }), [digitStyle]);
  const formatPercent = useCallback((v: number) => `${v >= 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 2 })}%`, [digitStyle]);
  const formatDate = useCallback(
    (time: number) =>
      new Intl.DateTimeFormat(locale, { timeZone: "UTC", year: "numeric", month: "short", day: timeframe === "M" ? undefined : "numeric" }).format(new Date(time * 1000)),
    [locale, timeframe]
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
      close: t("closeLabel"),
    }),
    [t]
  );

  const pairs = useMemo(() => {
    const mine = converterPair[0] !== converterPair[1] && hasEcbHistory(converterPair[0]) && hasEcbHistory(converterPair[1]);
    const list = TERMINAL_PAIRS.filter((p) => pairId(p) !== pairId(converterPair));
    return mine ? [converterPair, ...list.slice(0, TERMINAL_PAIRS.length - 1)] : TERMINAL_PAIRS;
  }, [converterPair]);

  const rows: InstrumentRow[] = pairs.map((p) => {
    const series = recent.status === "ready" ? crossSeries(recent.data, p[0], p[1]) : [];
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    const change = last && prev ? (last.rate / prev.rate - 1) * 100 : null;
    return {
      id: pairId(p),
      name: pairId(p) === pairId(converterPair) ? t("yourPair") : `${p[0]} → ${p[1]}`,
      sub: pairId(p),
      price: last ? formatPrice(last.rate) : "…",
      change,
      changeText: change === null ? "—" : f.signedPct(change),
    };
  });

  return (
    <SectionCard id="chart" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { base, quote })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <MarketChart
        timeframes={TIMEFRAMES.map((id) => ({ id, label: t(`tf.${id}`) }))}
        timeframe={timeframe}
        onTimeframe={(id) => setTimeframe(id as Timeframe)}
        state={state}
        onRetry={() => setRetry((r) => r + 1)}
        logScale={timeframe === "M"}
        formatPrice={formatPrice}
        formatPercent={formatPercent}
        formatDate={formatDate}
        labels={labels}
      />

      <InstrumentList
        title={t("listTitle")}
        badge={<span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{t("listBadge")}</span>}
        rows={rows}
        activeId={pairId(pair)}
        onSelect={(id) => onSelectPair(id.split("/") as [string, string])}
        note={t("listNote")}
        rowAttr="data-pair"
      />

      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        {t(timeframe === "D" ? "candleNoteDaily" : "candleNote")} {t("attribution")}{" "}
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline">
          TradingView
        </a>
      </p>
      <DataSourceNote sourceKey="frankfurter" className="mt-1" />
    </SectionCard>
  );
}
