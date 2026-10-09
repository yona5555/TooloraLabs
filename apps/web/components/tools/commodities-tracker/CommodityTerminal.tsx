"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { dailyToCandles, dailyToLine, type Candle } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import MarketChart, { type MarketChartState } from "@/components/tools/markets/MarketChart";
import InstrumentList, { type InstrumentRow } from "@/components/tools/markets/InstrumentList";
import { useFiat, useMarketFormatters } from "@/components/tools/markets/fiat";
import DataSourceNote from "./DataSourceNote";
import { COMMODITIES, type CommodityId, type Spot } from "./types";
import { useCommodityHistory, useGoldCandles, type History, type Loaded } from "./useCommodityData";

/** What each instrument's free source can honestly show. */
const TIMEFRAMES: Record<CommodityId, string[]> = {
  gold: ["1h", "4h", "1D", "1M"],
  silver: ["M"],
  wti: ["D", "W", "M"],
  brent: ["D", "W", "M"],
};
const DAILY_POINTS = 520;

type Props = {
  instrument: CommodityId;
  onSelect: (id: CommodityId) => void;
  spot: Spot;
  digitStyle: DigitStyle;
};

const lastChange = (h: Loaded<History>) => {
  if (h.status !== "ready") return null;
  const p = h.data.points.filter((x) => x.rate > 0);
  return p.length > 1 ? (p[p.length - 1].rate / p[p.length - 2].rate - 1) * 100 : null;
};

export default function CommodityTerminal({ instrument, onSelect, spot, digitStyle }: Props) {
  const t = useTranslations("tools.commodities-tracker.chart");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const locale = useLocale();
  const fiat = useFiat();
  const f = useMarketFormatters(digitStyle);
  const [picked, setPicked] = useState<Record<CommodityId, string>>({ gold: "1D", silver: "M", wti: "W", brent: "W" });
  const [retry, setRetry] = useState(0);
  const timeframe = picked[instrument];

  const goldH = useCommodityHistory("gold");
  const silverH = useCommodityHistory("silver", instrument === "silver" ? retry : 0);
  const wtiH = useCommodityHistory("wti", instrument === "wti" ? retry : 0);
  const brentH = useCommodityHistory("brent", instrument === "brent" ? retry : 0);
  const gold = useGoldCandles(instrument === "gold" ? timeframe : "1D", instrument === "gold" ? retry : 0);
  const history = instrument === "gold" ? goldH : instrument === "silver" ? silverH : instrument === "wti" ? wtiH : brentH;
  const histories: Record<CommodityId, Loaded<History>> = { gold: goldH, silver: silverH, wti: wtiH, brent: brentH };

  const state: MarketChartState = useMemo(() => {
    const err = { status: "error" as const, message: t("error") };
    if (instrument === "gold") {
      if (gold.status === "loading") return { status: "loading" };
      return gold.status === "ready" ? { status: "ready", mode: "candles", candles: gold.data.candles } : err;
    }
    if (history.status === "loading") return { status: "loading" };
    if (history.status !== "ready") return err;
    const points = history.data.points;
    if (timeframe === "M" && history.data.frequency === "monthly") return { status: "ready", mode: "line", candles: dailyToLine(points) };
    if (timeframe === "D") return { status: "ready", mode: "line", candles: dailyToLine(points.slice(-DAILY_POINTS)) };
    return { status: "ready", mode: "candles", candles: dailyToCandles(points, timeframe === "W" ? "week" : "month") };
  }, [instrument, gold, history, timeframe, t]);

  const intraday = instrument === "gold" && (timeframe === "1h" || timeframe === "4h");
  // Series are in USD; the axis reads in the display currency at today's rate.
  const formatPrice = useCallback((p: number) => formatLocalizedNumber(p * fiat.perUsd, digitStyle, { maximumFractionDigits: 2 }), [fiat.perUsd, digitStyle]);
  const formatPercent = useCallback((v: number) => `${v >= 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 2 })}%`, [digitStyle]);
  const monthOnly = timeframe === "M" || timeframe === "1M";
  const formatDate = useCallback(
    (time: number) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: monthOnly ? undefined : "numeric",
        hour: intraday ? "2-digit" : undefined,
        minute: intraday ? "2-digit" : undefined,
      }).format(new Date(time * 1000)),
    [locale, monthOnly, intraday]
  );
  const formatVolume = useCallback((c: Candle) => `Vol ${formatLocalizedNumber(c.volume, digitStyle, { maximumFractionDigits: 1 })} PAXG`, [digitStyle]);
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

  const rows: InstrumentRow[] = COMMODITIES.map((id) => {
    const change = lastChange(histories[id]);
    const price = spot[id];
    return {
      id,
      name: tA(`commodity.${id}`),
      sub: t(`sub.${id}`),
      price: price === null ? "—" : f.money(price),
      change,
      changeText: change === null ? "—" : `${f.signedPct(change)} ${t(`changeSpan.${id}`)}`,
    };
  });

  return (
    <SectionCard id="chart" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { name: tA(`commodity.${instrument}`), currency: fiat.code })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`intro.${instrument}`)}</p>

      <MarketChart
        timeframes={TIMEFRAMES[instrument].map((id) => ({ id, label: t(`tf.${id}`) }))}
        timeframe={timeframe}
        onTimeframe={(id) => setPicked((p) => ({ ...p, [instrument]: id }))}
        state={state}
        onRetry={() => setRetry((r) => r + 1)}
        logScale={monthOnly && instrument !== "gold"}
        intraday={intraday}
        formatPrice={formatPrice}
        formatPercent={formatPercent}
        formatDate={formatDate}
        formatVolume={instrument === "gold" ? formatVolume : undefined}
        labels={labels}
      />

      <InstrumentList
        title={t("listTitle")}
        badge={<span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{t("listBadge")}</span>}
        rows={rows}
        activeId={instrument}
        onSelect={(id) => onSelect(id as CommodityId)}
        note={t("listNote")}
        rowAttr="data-instrument"
      />

      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        {t(`limits.${instrument}`)} {t("attribution")}{" "}
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline">
          TradingView
        </a>
      </p>
      <DataSourceNote sourceKey={instrument === "gold" ? "paxg" : instrument === "silver" ? "insee" : "fred"} className="mt-1" />
    </SectionCard>
  );
}
