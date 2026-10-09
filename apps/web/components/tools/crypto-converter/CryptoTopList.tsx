"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { topMovers, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useCryptoFormatters, changeColor } from "./cryptoFormat";

type CryptoTopListProps = {
  coins: CryptoCoin[];
  digitStyle: DigitStyle;
  fromCoinId: string;
  toCoinId: string;
  onPick: (id: string) => void;
};

type Tag = "yours" | "stable" | "gainer" | "loser" | "capped";

const TAG_STYLE: Record<Tag, string> = {
  yours: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  stable: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  gainer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  loser: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  capped: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

/** A dollar-pegged coin: trades within 2% of $1 and its name or ticker says USD. */
const isStablecoin = (c: CryptoCoin) => Math.abs(c.currentPrice - 1) < 0.02 && /usd/i.test(`${c.symbol} ${c.name}`);

export default function CryptoTopList({ coins, digitStyle, fromCoinId, toCoinId, onPick }: CryptoTopListProps) {
  const t = useTranslations("tools.crypto-converter.topList");
  const [focusId, setFocusId] = useState<string | null>(null);
  const f = useCryptoFormatters(digitStyle);
  const money = (value: number, compact = false) => (compact ? f.compactMoney(value) : f.money(value));
  const movers = topMovers(coins, 5);
  const gainers = new Set(movers.gainers.map((c) => c.id));
  const losers = new Set(movers.losers.map((c) => c.id));
  const tagsFor = (c: CryptoCoin): Tag[] =>
    [
      (c.id === fromCoinId || c.id === toCoinId) && "yours",
      isStablecoin(c) && "stable",
      gainers.has(c.id) && "gainer",
      losers.has(c.id) && "loser",
      c.maxSupply && !isStablecoin(c) && "capped",
    ].filter(Boolean) as Tag[];
  const focus = coins.find((c) => c.id === (focusId ?? fromCoinId)) ?? coins[0];

  return (
    <SectionCard id="top-coins" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      {/* The 7-column table needs the full card width, so its worked example sits directly under it. */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="max-h-[480px] min-w-0 overflow-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-sm" data-testid="top-coins-table">
            <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800">
              <tr className="text-xs text-zinc-500 dark:text-zinc-400">
                <th className="px-2 py-2 text-start font-medium">#</th>
                <th className="px-2 py-2 text-start font-medium">{t("columnName")}</th>
                <th className="px-2 py-2 text-start font-medium">{t("columnTags")}</th>
                <th className="px-2 py-2 text-end font-medium">{t("columnPrice")}</th>
                <th className="px-2 py-2 text-end font-medium">{t("columnChange24h")}</th>
                <th className="px-2 py-2 text-end font-medium">{t("columnChange7d")}</th>
                <th className="px-2 py-2 text-end font-medium">{t("columnMarketCap")}</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => {
                const tags = tagsFor(coin);
                return (
                  <tr
                    key={coin.id}
                    onMouseEnter={() => setFocusId(coin.id)}
                    onClick={() => onPick(coin.id)}
                    title={t("pick")}
                    className={`cursor-pointer border-t border-zinc-100 hover:bg-blue-50/60 dark:border-zinc-800/60 dark:hover:bg-blue-500/5 ${tags.includes("yours") ? "bg-pink-50/50 dark:bg-pink-500/5" : ""}`}
                  >
                    <td dir="ltr" className="px-2 py-2 text-zinc-400">{coin.marketCapRank ?? "—"}</td>
                    <td className="px-2 py-2">
                      <span className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.image} alt="" width={18} height={18} className="shrink-0 rounded-full" />
                        <span className="max-w-[6rem] truncate font-medium text-zinc-900 dark:text-zinc-100" title={coin.symbol.toUpperCase()}>{coin.name}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className="flex flex-col items-start gap-0.5">
                        {tags.map((tag) => (
                          <span key={tag} className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${TAG_STYLE[tag]}`}>{t(`tags.${tag}`)}</span>
                        ))}
                      </span>
                    </td>
                    <td dir="ltr" className="px-2 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{money(coin.currentPrice)}</td>
                    <td dir="ltr" className={`px-2 py-2 text-end font-mono ${changeColor(coin.priceChangePercentage24h)}`}>
                      {coin.priceChangePercentage24h == null ? "—" : f.signedPct(coin.priceChangePercentage24h)}
                    </td>
                    <td dir="ltr" className={`px-2 py-2 text-end font-mono ${changeColor(coin.priceChangePercentage7d)}`}>
                      {coin.priceChangePercentage7d == null ? "—" : f.signedPct(coin.priceChangePercentage7d)}
                    </td>
                    <td dir="ltr" className="px-2 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{money(coin.marketCap, true)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {focus && (
          <div className="flex flex-col gap-1">
            <WorkedExampleNote
              title={t("workedTitle", { coin: focus.name })}
              rows={[
                { label: t("columnPrice"), value: money(focus.currentPrice) },
                { label: t("rowSupply"), value: focus.circulatingSupply ? `× ${f.compact(focus.circulatingSupply)}` : "—" },
                { label: t("columnMarketCap"), value: money(focus.marketCap, true), emphasize: true, note: t("rowCapNote") },
                { label: t("rowVolume"), value: focus.totalVolume ? money(focus.totalVolume, true) : "—" },
              ]}
            />
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{t("hoverHint")}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
