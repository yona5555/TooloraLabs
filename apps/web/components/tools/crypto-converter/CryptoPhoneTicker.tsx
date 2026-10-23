"use client";
import { useLocale, useTranslations } from "next-intl";
import { findCoinById, type CryptoCoin } from "@tooloralabs/tools";
import Sparkline from "@/components/tools-page/PulseSparkline";

/**
 * APPROVED PHONE STANDARD top mini cards: Bitcoin and Ethereum as two live mini cards under the title,
 * phone only (< 768px). The /tools ticker chip (price, 24h change, sparkline), grown to 64px; tapping
 * one makes it the "from" coin. Prices and 24h change are the page's own CoinGecko list; each trend is
 * the coin's last 30 daily closes (the converter chart's Coinbase candles). No trend hides only the line.
 */
const COINS = ["bitcoin", "ethereum"] as const;

export type PhoneTrends = Partial<Record<(typeof COINS)[number], number[]>>;

type Props = {
  coins: CryptoCoin[];
  trends: PhoneTrends;
  fromCoinId: string;
  onPick: (id: string) => void;
};

export default function CryptoPhoneTicker({ coins, trends, fromCoinId, onPick }: Props) {
  const t = useTranslations("tools.crypto-converter.phoneTicker");
  const locale = useLocale();
  const money = new Intl.NumberFormat(`${locale}-u-nu-latn`, { maximumFractionDigits: 0 });

  const cards = COINS.map((id) => ({ id, coin: findCoinById(coins, id) })).filter(
    (c): c is { id: (typeof COINS)[number]; coin: CryptoCoin } => !!c.coin && Number.isFinite(c.coin.currentPrice)
  );
  if (cards.length === 0) return null;

  return (
    <ul aria-label={t("label")} data-phone-ticker="" className="mb-4 grid grid-cols-2 gap-2 md:hidden">
      {cards.map(({ id, coin }) => {
        const change = coin.priceChangePercentage24h;
        const up = (change ?? 0) >= 0;
        const trend = trends[id];
        const name = t(id);
        const active = fromCoinId === id;
        return (
          <li key={id} className="min-w-0">
            <button
              type="button"
              onClick={() => onPick(id)}
              aria-label={t("setFrom", { coin: name })}
              aria-pressed={active}
              data-ticker-card=""
              className={`flex h-16 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-900 ${
                active ? "border-blue-500 ring-1 ring-blue-500" : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <span className="flex min-w-0 flex-col gap-0.5 leading-4">
                <span className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {name} <span dir="ltr">· {coin.symbol.toUpperCase()}</span>
                </span>
                <span dir="ltr" className="truncate text-start text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  ${money.format(coin.currentPrice)}
                </span>
                {change !== null && change !== undefined && Number.isFinite(change) && (
                  <span dir="ltr" className={`text-start text-[11px] font-semibold tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {up ? "+" : ""}
                    {change.toFixed(2)}% · {t("change")}
                  </span>
                )}
              </span>
              {trend && trend.length >= 2 && <Sparkline points={trend} up={up} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
