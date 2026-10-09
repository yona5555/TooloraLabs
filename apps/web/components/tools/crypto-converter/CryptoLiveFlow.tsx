"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useLiveTicks, type LiveTick } from "./useCryptoLive";

type CryptoLiveFlowProps = {
  fromCoin: CryptoCoin | undefined;
  toCoin: CryptoCoin | undefined;
  amount: number;
  digitStyle: DigitStyle;
};

type Point = { timestamp: number; price: number };

const SPARK_W = 112;
const SPARK_H = 34;

/** 24h price path for one coin, from the page's own CoinGecko chart route (5-minute points). */
function useSparkline(coinId: string | undefined) {
  const [data, setData] = useState<{ id: string; points: Point[] } | null>(null);
  useEffect(() => {
    if (!coinId) return;
    let cancelled = false;
    fetch(`/api/crypto/chart?coin=${encodeURIComponent(coinId)}&days=1`)
      .then((r) => (r.ok ? r.json() : { points: [] }))
      .then((json: { points: Point[] }) => !cancelled && setData({ id: coinId, points: json.points ?? [] }))
      .catch(() => !cancelled && setData({ id: coinId, points: [] }));
    return () => {
      cancelled = true;
    };
  }, [coinId]);
  return data && data.id === coinId ? data.points : null;
}

function Sparkline({ points, livePrice, up }: { points: Point[] | null; livePrice: number; up: boolean }) {
  if (!points || points.length < 2) {
    return <div style={{ width: SPARK_W, height: SPARK_H }} className="animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />;
  }
  const prices = [...points.map((p) => p.price), livePrice];
  const min = Math.min(...prices);
  const range = Math.max(...prices) - min || 1;
  const coords = prices.map((p, i) => [(i / (prices.length - 1)) * SPARK_W, SPARK_H - 2 - ((p - min) / range) * (SPARK_H - 4)]);
  const d = `M ${coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")}`;
  const [lx, ly] = coords[coords.length - 1];
  const stroke = up ? "stroke-emerald-500" : "stroke-red-500";
  return (
    <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} aria-hidden>
      <path d={d} fill="none" strokeWidth={1.5} className={stroke} />
      <circle cx={lx} cy={ly} r={2.5} className={up ? "fill-emerald-500" : "fill-red-500"} />
    </svg>
  );
}

function CoinNode({
  coin,
  tick,
  amountLabel,
  digitStyle,
}: {
  coin: CryptoCoin;
  tick: LiveTick | undefined;
  amountLabel: string;
  digitStyle: DigitStyle;
}) {
  const t = useTranslations("tools.crypto-converter.liveFlow");
  const points = useSparkline(coin.id);
  const price = tick?.price ?? coin.currentPrice;
  // 24h change re-based on the live price against the 24h-ago point when we have it.
  const open = points?.[0]?.price;
  const change = open ? ((price - open) / open) * 100 : coin.priceChangePercentage24h ?? 0;
  const flash = tick?.direction === "up" ? "animate-flash-up" : tick?.direction === "down" ? "animate-flash-down" : "";

  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt="" width={22} height={22} className="rounded-full" />
        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{coin.name}</span>
        <span dir="ltr" className="ms-auto text-xs uppercase text-zinc-400">
          {coin.symbol}
        </span>
      </div>
      <div dir="ltr" className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
        <span key={tick?.at ?? 0} data-testid={`live-price-${coin.symbol}`} className={`rounded px-0.5 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 ${flash}`}>
          {formatLocalizedNumber(price, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: price < 1 ? 6 : 2 })}
        </span>
        <span className={`font-mono text-xs font-semibold ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {change >= 0 ? "+" : ""}
          {formatLocalizedNumber(change, digitStyle, { maximumFractionDigits: 2 })}%
        </span>
      </div>
      <div dir="ltr" className="mt-1 flex items-end justify-between gap-1">
        <Sparkline points={points} livePrice={price} up={change >= 0} />
        <span className="text-[10px] text-zinc-400">{t("spark24h")}</span>
      </div>
      <p dir="ltr" className="mt-1 truncate text-end font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
        {amountLabel}
      </p>
    </div>
  );
}

export default function CryptoLiveFlow({ fromCoin, toCoin, amount, digitStyle }: CryptoLiveFlowProps) {
  const t = useTranslations("tools.crypto-converter.liveFlow");
  const ticks = useLiveTicks([fromCoin?.symbol ?? "", toCoin?.symbol ?? ""].filter(Boolean));
  if (!fromCoin || !toCoin) return null;

  const fromTick = ticks[fromCoin.symbol.toUpperCase()];
  const toTick = ticks[toCoin.symbol.toUpperCase()];
  const fromPrice = fromTick?.price ?? fromCoin.currentPrice;
  const toPrice = toTick?.price ?? toCoin.currentPrice;
  const amt = Number.isFinite(amount) ? amount : 0;
  const converted = convertCryptoAmount(amt, fromPrice, toPrice);
  const rate = convertCryptoAmount(1, fromPrice, toPrice);
  const isLive = Boolean(fromTick || toTick);

  const n = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 8 : 4 });
  const usd = (v: number) => formatLocalizedNumber(v, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: v < 1 ? 6 : 2 });
  const sym = (c: CryptoCoin) => c.symbol.toUpperCase();

  return (
    <SectionCard
      id="indicators"
      title={t("title")}
      action={
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white" data-testid="live-badge">
          <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-emerald-300" : "bg-white/50"}`} />
          {isLive ? t("live") : t("snapshot")}
        </span>
      }
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {t("heading", { from: sym(fromCoin), to: sym(toCoin) })}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="@container mt-4">
       <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-center">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 @2xl:w-[26rem] @2xl:shrink-0">
          <CoinNode coin={fromCoin} tick={fromTick} amountLabel={`${n(amt)} ${sym(fromCoin)}`} digitStyle={digitStyle} />
          {/* Flow arrow with the live rate embedded on its shaft; flips direction in RTL */}
          <div className="flex flex-col items-center gap-1" aria-hidden>
            <div dir="ltr" className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm" data-testid="flow-rate">
              × {n(rate)}
            </div>
            <div className="flex items-center rtl:rotate-180">
              <div className="h-1 w-6 rounded bg-blue-500" />
              <div className="h-0 w-0 border-y-[7px] border-s-[9px] border-y-transparent border-s-blue-500" />
            </div>
          </div>
          <CoinNode coin={toCoin} tick={toTick} amountLabel={`${n(converted)} ${sym(toCoin)}`} digitStyle={digitStyle} />
        </div>

        <div className="min-w-0 flex-1">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowAmount"), value: `${n(amt)} ${sym(fromCoin)}` },
              { label: t("rowFromPrice", { symbol: sym(fromCoin) }), value: `× ${usd(fromPrice)}` },
              { label: t("rowUsd"), value: `= ${usd(amt * fromPrice)}` },
              { label: t("rowToPrice", { symbol: sym(toCoin) }), value: `÷ ${usd(toPrice)}` },
              { label: t("rowRate"), value: `1 ${sym(fromCoin)} = ${n(rate)} ${sym(toCoin)}` },
              { label: t("rowResult"), value: `${n(converted)} ${sym(toCoin)}`, emphasize: true, note: isLive ? t("liveNote") : t("snapshotNote") },
            ]}
          />
        </div>
       </div>
      </div>
    </SectionCard>
  );
}
