"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { FiatCurrency } from "./types";

type CryptoTopListProps = {
  coins: CryptoCoin[];
  fiatCurrency: FiatCurrency;
  usdToSarRate: number | null;
  digitStyle: DigitStyle;
};

export default function CryptoTopList({ coins, fiatCurrency, usdToSarRate, digitStyle }: CryptoTopListProps) {
  const t = useTranslations("tools.crypto-converter.topList");
  const currency = fiatCurrency === "sar" && usdToSarRate ? "SAR" : "USD";
  const rate = fiatCurrency === "sar" && usdToSarRate ? usdToSarRate : 1;

  const compact = (value: number) =>
    formatLocalizedNumber(value * rate, digitStyle, {
      style: "currency",
      currency,
      notation: "compact",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const price = (value: number) =>
    formatLocalizedNumber(value * rate, digitStyle, {
      style: "currency",
      currency,
      maximumFractionDigits: value < 1 ? 6 : 2,
    });

  return (
    <SectionCard title={t("title")} bodyClassName="p-0">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/90">
            <tr className="text-xs text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2.5 text-start font-medium">#</th>
              <th className="px-4 py-2.5 text-start font-medium">{t("columnName")}</th>
              <th className="px-4 py-2.5 text-end font-medium">{t("columnPrice")}</th>
              <th className="px-4 py-2.5 text-end font-medium">{t("columnChange24h")}</th>
              <th className="px-4 py-2.5 text-end font-medium">{t("columnMarketCap")}</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const change = coin.priceChangePercentage24h;
              return (
                <tr key={coin.id} className="border-t border-zinc-100 dark:border-zinc-800/60">
                  <td dir="ltr" className="px-4 py-2.5 text-zinc-400">
                    {coin.marketCapRank ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coin.image} alt="" width={20} height={20} className="shrink-0 rounded-full" />
                      <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{coin.name}</span>
                      <span dir="ltr" className="shrink-0 text-xs uppercase text-zinc-400">
                        {coin.symbol}
                      </span>
                    </span>
                  </td>
                  <td dir="ltr" className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {price(coin.currentPrice)}
                  </td>
                  <td
                    dir="ltr"
                    className={`px-4 py-2.5 text-end font-mono ${
                      change === null
                        ? "text-zinc-400"
                        : change >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {change === null ? "—" : `${change >= 0 ? "+" : ""}${formatLocalizedNumber(change, digitStyle, { maximumFractionDigits: 2 })}%`}
                  </td>
                  <td dir="ltr" className="px-4 py-2.5 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {compact(coin.marketCap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
