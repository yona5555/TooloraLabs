"use client";
import { useEffect, useState } from "react";
import Sparkline, { useRelativeUpdatedLabel } from "@/components/tools/markets/Sparkline";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import CopyButton from "@/components/tool-ui/CopyButton";
import ShareExportModal from "@/components/tools/markets/ShareExportModal";
import { useCryptoFormatters } from "./cryptoFormat";
import type { LiveTick } from "./useCryptoLive";

type CryptoLiveFlowProps = {
  fromCoin: CryptoCoin | undefined;
  toCoin: CryptoCoin | undefined;
  /** The amount exactly as typed, for the share text. */
  amountText: string;
  amount: number;
  ticks: Record<string, LiveTick>;
  lastUpdated: number;
  digitStyle: DigitStyle;
};

type Point = { timestamp: number; price: number };

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
  const f = useCryptoFormatters(digitStyle);
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
          {f.money(price)}
        </span>
        <span className={`font-mono text-xs font-semibold ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {change >= 0 ? "+" : ""}
          {formatLocalizedNumber(change, digitStyle, { maximumFractionDigits: 2 })}%
        </span>
      </div>
      <div dir="ltr" className="mt-1 flex items-end justify-between gap-1">
        <Sparkline values={points ? [...points.map((p) => p.price), price] : null} up={change >= 0} />
        <span className="text-[10px] text-zinc-400">{t("spark24h")}</span>
      </div>
      <p dir="ltr" className="mt-1 truncate text-end font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
        {amountLabel}
      </p>
    </div>
  );
}

export default function CryptoLiveFlow({ fromCoin, toCoin, amountText, amount, ticks, lastUpdated, digitStyle }: CryptoLiveFlowProps) {
  const t = useTranslations("tools.crypto-converter.liveFlow");
  const tAbove = useTranslations("tools.crypto-converter.aboveFold");
  const locale = useLocale();
  const updatedLabel = useRelativeUpdatedLabel(lastUpdated, locale);
  const f = useCryptoFormatters(digitStyle);
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
  const usd = f.money;
  const sym = (c: CryptoCoin) => c.symbol.toUpperCase();
  const resultText = n(converted);
  const summaryText = `${resultText} ${sym(toCoin)}`;
  const updated = tAbove("lastUpdated", { time: updatedLabel });

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
       <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-stretch">
        <div className="flex flex-col justify-between gap-4 @2xl:w-[26rem] @2xl:shrink-0">
        {/* The converted amount itself, at live prices, with its value in the display currency. */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-500/30 dark:bg-blue-500/5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tAbove("resultTitle")}</p>
          <p className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50" data-testid="converted-amount">
            <span dir="ltr">
              {resultText} <span className="text-lg font-semibold uppercase text-zinc-500 dark:text-zinc-400">{toCoin.symbol}</span>
            </span>
          </p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300" data-testid="converted-fiat">
            <span dir="ltr">≈ {usd(amt * fromPrice)}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{updated}</span>
            <div className="flex items-center gap-2">
              <CopyButton text={summaryText} />
              <ShareExportModal
              namespace="tools.crypto-converter"
              operationLabel={`${sym(fromCoin)} → ${sym(toCoin)}`}
              inputRows={[{ label: sym(fromCoin), value: `${amountText} ${sym(fromCoin)}` }]}
              resultRows={[
                { label: sym(toCoin), value: summaryText },
                { label: `1 ${sym(fromCoin)}`, value: usd(fromPrice) },
                { label: `1 ${sym(toCoin)}`, value: usd(toPrice) },
              ]}
              heroLabel={sym(toCoin)}
              heroValue={summaryText}
              sentence={`${amountText} ${sym(fromCoin)} = ${summaryText} (${updated}).`}
            />
            </div>
          </div>
          {f.currency !== "USD" && <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{tAbove("fxNote", { currency: f.currency })}</p>}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
          <CoinNode coin={fromCoin} tick={fromTick} amountLabel={`${n(amt)} ${sym(fromCoin)}`} digitStyle={digitStyle} />
          {/* Flow arrow with the live rate embedded on its shaft; the logical border points it the reading way in RTL too */}
          <div className="flex flex-col items-center gap-1" aria-hidden>
            <div dir="ltr" className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm" data-testid="flow-rate">
              × {n(rate)}
            </div>
            <div className="flex items-center">
              <div className="h-1 w-6 rounded bg-blue-500" />
              <div className="h-0 w-0 border-y-[7px] border-s-[9px] border-y-transparent border-s-blue-500" />
            </div>
          </div>
          <CoinNode coin={toCoin} tick={toTick} amountLabel={`${n(converted)} ${sym(toCoin)}`} digitStyle={digitStyle} />
        </div>
        </div>

        <div className="min-w-0 flex-1">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowAmount"), value: `${n(amt)} ${sym(fromCoin)}` },
              { label: t("rowFromPrice", { symbol: sym(fromCoin) }), value: `× ${usd(fromPrice)}` },
              { label: t("rowUsd", { currency: f.currency }), value: `= ${usd(amt * fromPrice)}` },
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
