"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { cryptoFormatters, changeColor } from "./cryptoFormat";

type Props = { fromCoin: CryptoCoin | undefined; toCoin: CryptoCoin | undefined; digitStyle: DigitStyle };

export default function CryptoComparisonCards({ fromCoin, toCoin, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.compare");
  if (!fromCoin || !toCoin) return null;
  const f = cryptoFormatters(digitStyle);
  const pct = (v: number | null | undefined) => (v == null ? "—" : f.signedPct(v));
  const metrics = (c: CryptoCoin) => [
    { key: "price", value: f.usd(c.currentPrice), raw: c.currentPrice },
    { key: "marketCap", value: f.compactUsd(c.marketCap), raw: c.marketCap },
    { key: "volume", value: c.totalVolume ? f.compactUsd(c.totalVolume) : "—", raw: c.totalVolume ?? 0 },
    { key: "change24h", value: pct(c.priceChangePercentage24h), raw: c.priceChangePercentage24h ?? -Infinity, color: changeColor(c.priceChangePercentage24h) },
    { key: "change7d", value: pct(c.priceChangePercentage7d), raw: c.priceChangePercentage7d ?? -Infinity, color: changeColor(c.priceChangePercentage7d) },
    { key: "rank", value: c.marketCapRank ? `#${c.marketCapRank}` : "—", raw: c.marketCapRank ? -c.marketCapRank : -Infinity },
  ];
  const a = metrics(fromCoin);
  const b = metrics(toCoin);
  const turnover = (c: CryptoCoin) => (c.totalVolume && c.marketCap ? (c.totalVolume / c.marketCap) * 100 : null);

  const card = (coin: CryptoCoin, mine: typeof a, other: typeof a, accent: string) => (
    <div className={`min-w-0 flex-1 rounded-xl border-2 p-3 ${accent}`}>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt="" width={24} height={24} className="rounded-full" />
        <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{coin.name}</span>
        <span dir="ltr" className="ms-auto text-xs uppercase text-zinc-400">{coin.symbol}</span>
      </div>
      <dl className="mt-2 space-y-1.5 text-sm">
        {mine.map((m, i) => (
          <div key={m.key} className="flex items-baseline justify-between gap-2">
            <dt className="text-zinc-500 dark:text-zinc-400">{t(m.key)}</dt>
            <dd dir="ltr" className={`font-mono font-semibold ${m.color ?? "text-zinc-900 dark:text-zinc-100"}`}>
              {m.raw > other[i].raw && m.key !== "price" ? "▲ " : ""}
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  const tf = turnover(fromCoin);
  const tt = turnover(toCoin);

  return (
    <SectionCard id="compare" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { from: fromCoin.name, to: toCoin.name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row" data-testid="compare-cards">
          {card(fromCoin, a, b, "border-blue-300 dark:border-blue-500/40")}
          {card(toCoin, b, a, "border-pink-300 dark:border-pink-500/40")}
        </div>
        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowCapRatio"), value: `${f.num(fromCoin.marketCap / Math.max(1, toCoin.marketCap), 2)}×`, note: t("rowCapRatioNote") },
              { label: t("rowTurnover", { symbol: fromCoin.symbol.toUpperCase() }), value: tf !== null ? `${f.num(tf, 2)}%` : "—" },
              { label: t("rowTurnover", { symbol: toCoin.symbol.toUpperCase() }), value: tt !== null ? `${f.num(tt, 2)}%`: "—", note: t("rowTurnoverNote") },
              {
                label: t("rowGap"),
                value: fromCoin.priceChangePercentage24h != null && toCoin.priceChangePercentage24h != null ? `${f.num(fromCoin.priceChangePercentage24h - toCoin.priceChangePercentage24h, 2)} pp` : "—",
                emphasize: true,
                note: t("rowGapNote"),
              },
            ]}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("legend")}</p>
    </SectionCard>
  );
}
