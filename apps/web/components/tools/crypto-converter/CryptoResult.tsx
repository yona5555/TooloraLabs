"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { FiatCurrency } from "./types";

type CryptoResultProps = {
  fromCoin: CryptoCoin | undefined;
  toCoin: CryptoCoin | undefined;
  convertedAmount: number;
  fiatCurrency: FiatCurrency;
  onFiatCurrencyChange: (currency: FiatCurrency) => void;
  usdToSarRate: number | null;
  lastUpdated: number;
  digitStyle: DigitStyle;
};

function useRelativeUpdatedLabel(lastUpdated: number, locale: string): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const minutesAgo = Math.max(0, Math.round((now - lastUpdated) / 60_000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return minutesAgo === 0 ? rtf.format(0, "minute") : rtf.format(-minutesAgo, "minute");
}

function PriceTile({ coin, fiatCurrency, usdToSarRate, digitStyle }: {
  coin: CryptoCoin;
  fiatCurrency: FiatCurrency;
  usdToSarRate: number | null;
  digitStyle: DigitStyle;
}) {
  const priceInCurrency =
    fiatCurrency === "sar" && usdToSarRate ? coin.currentPrice * usdToSarRate : coin.currentPrice;
  const currency = fiatCurrency === "sar" && usdToSarRate ? "SAR" : "USD";
  const change = coin.priceChangePercentage24h;

  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt="" width={14} height={14} className="rounded-full" />
        <span dir="ltr" className="uppercase">{coin.symbol}</span>
      </dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {formatLocalizedNumber(priceInCurrency, digitStyle, {
          style: "currency",
          currency,
          maximumFractionDigits: priceInCurrency < 1 ? 6 : 2,
        })}
      </dd>
      {change !== null && (
        <dd dir="ltr" className={`mt-0.5 text-xs font-medium ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {change >= 0 ? "+" : ""}
          {formatLocalizedNumber(change, digitStyle, { maximumFractionDigits: 2 })}%
        </dd>
      )}
    </div>
  );
}

export default function CryptoResult({
  fromCoin,
  toCoin,
  convertedAmount,
  fiatCurrency,
  onFiatCurrencyChange,
  usdToSarRate,
  lastUpdated,
  digitStyle,
}: CryptoResultProps) {
  const t = useTranslations("tools.crypto-converter.aboveFold");
  const locale = useLocale();
  const updatedLabel = useRelativeUpdatedLabel(lastUpdated, locale);

  const resultText = toCoin
    ? formatLocalizedNumber(convertedAmount, digitStyle, { maximumFractionDigits: convertedAmount < 1 ? 8 : 4 })
    : "";
  const summaryText = toCoin ? `${resultText} ${toCoin.symbol.toUpperCase()}` : "";

  return (
    <SectionCard
      title={t("resultTitle")}
      action={toCoin && <CopyButton text={summaryText} />}
    >
      <div className="text-center">
        {toCoin ? (
          <>
            <p dir="ltr" className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {resultText}
            </p>
            <p dir="ltr" className="mt-1 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              {toCoin.symbol}
            </p>
          </>
        ) : (
          <p className="text-zinc-400">{t("pickerPlaceholder")}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{t("lastUpdated", { time: updatedLabel })}</span>
        <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {(["usd", "sar"] as const).map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => onFiatCurrencyChange(currency)}
              disabled={currency === "sar" && !usdToSarRate}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ${
                fiatCurrency === currency
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {(fromCoin || toCoin) && (
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {fromCoin && <PriceTile coin={fromCoin} fiatCurrency={fiatCurrency} usdToSarRate={usdToSarRate} digitStyle={digitStyle} />}
          {toCoin && <PriceTile coin={toCoin} fiatCurrency={fiatCurrency} usdToSarRate={usdToSarRate} digitStyle={digitStyle} />}
        </dl>
      )}
    </SectionCard>
  );
}
