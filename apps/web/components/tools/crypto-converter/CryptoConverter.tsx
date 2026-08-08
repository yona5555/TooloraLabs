"use client";
import { useMemo, useState } from "react";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, findCoinById, type CryptoCoin, type CryptoGlobalStats } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import CryptoInputPanel from "./CryptoInputPanel";
import CryptoResult from "./CryptoResult";
import CryptoDisclaimer from "./CryptoDisclaimer";
import CryptoTopList from "./CryptoTopList";
import CryptoHistoricalChart from "./CryptoHistoricalChart";
import CryptoWhatIfCalculator from "./CryptoWhatIfCalculator";
import CryptoGlobalIndicators from "./CryptoGlobalIndicators";
import CryptoNews from "./CryptoNews";
import CryptoLearningResources from "./CryptoLearningResources";
import type { FiatCurrency } from "./types";
import type { ReactNode } from "react";

type CryptoConverterProps = {
  initialCoins: CryptoCoin[];
  globalStats: CryptoGlobalStats | null;
  usdToSarRate: number | null;
  fetchedAt: number;
  education: ReactNode;
};

export default function CryptoConverter({ initialCoins, globalStats, usdToSarRate, fetchedAt, education }: CryptoConverterProps) {
  const [coins, setCoins] = useState<CryptoCoin[]>(initialCoins);
  const [fromCoinId, setFromCoinId] = useState("bitcoin");
  const [toCoinId, setToCoinId] = useState("ethereum");
  const [amount, setAmount] = useState("1");
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>("usd");

  const digitStyle: DigitStyle = resolveDigitStyle(amount);

  function handleCoinDiscovered(coin: CryptoCoin) {
    setCoins((prev) => (prev.some((c) => c.id === coin.id) ? prev : [...prev, coin]));
  }

  function handleSwap() {
    setFromCoinId(toCoinId);
    setToCoinId(fromCoinId);
  }

  const fromCoin = findCoinById(coins, fromCoinId);
  const toCoin = findCoinById(coins, toCoinId);

  const convertedAmount = useMemo(() => {
    const amountValue = parseLocalizedNumber(amount);
    if (!fromCoin || !toCoin || Number.isNaN(amountValue)) return 0;
    return convertCryptoAmount(amountValue, fromCoin.currentPrice, toCoin.currentPrice);
  }, [amount, fromCoin, toCoin]);

  return (
    <>
      <ToolAboveFold
        input={
          <CryptoInputPanel
            coins={coins}
            amount={amount}
            onAmountChange={setAmount}
            fromCoinId={fromCoinId}
            onFromCoinChange={setFromCoinId}
            toCoinId={toCoinId}
            onToCoinChange={setToCoinId}
            onCoinDiscovered={handleCoinDiscovered}
            onSwap={handleSwap}
          />
        }
        result={
          <CryptoResult
            fromCoin={fromCoin}
            toCoin={toCoin}
            convertedAmount={convertedAmount}
            fiatCurrency={fiatCurrency}
            onFiatCurrencyChange={setFiatCurrency}
            usdToSarRate={usdToSarRate}
            lastUpdated={fetchedAt}
            digitStyle={digitStyle}
          />
        }
        sidebar={<RelatedToolsSidebar currentSlug="crypto-converter" category="financial-markets" />}
        secondary={
          <div className="flex flex-col gap-6">
            <CryptoDisclaimer />
            <CryptoTopList coins={initialCoins} fiatCurrency={fiatCurrency} usdToSarRate={usdToSarRate} digitStyle={digitStyle} />
            <CryptoHistoricalChart coins={coins} onCoinDiscovered={handleCoinDiscovered} digitStyle={digitStyle} />
            <CryptoWhatIfCalculator coins={coins} onCoinDiscovered={handleCoinDiscovered} digitStyle={digitStyle} />
            {globalStats && <CryptoGlobalIndicators stats={globalStats} digitStyle={digitStyle} />}
            <CryptoNews />
            <CryptoLearningResources />
          </div>
        }
      />

      {education}
    </>
  );
}
