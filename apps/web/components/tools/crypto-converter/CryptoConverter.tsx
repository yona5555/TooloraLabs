"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, findCoinById, type CryptoCoin, type CryptoGlobalStats } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import CryptoInputPanel from "./CryptoInputPanel";
import CryptoResult from "./CryptoResult";
import CryptoTopList from "./CryptoTopList";
import CryptoHistoricalChart from "./CryptoHistoricalChart";
import CryptoWhatIfCalculator from "./CryptoWhatIfCalculator";
import CryptoLiveFlow from "./CryptoLiveFlow";
import CryptoDominanceDonut from "./CryptoDominanceDonut";
import CryptoFearGreed from "./CryptoFearGreed";
import CryptoNetworkFees from "./CryptoNetworkFees";
import CryptoHalvingSteps from "./CryptoHalvingSteps";
import CryptoVolatilityGauge from "./CryptoVolatilityGauge";
import CryptoSensitivityTrio from "./CryptoSensitivityTrio";
import CryptoComparisonCards from "./CryptoComparisonCards";
import CryptoSupplyBar from "./CryptoSupplyBar";
import CryptoCoinTimeline from "./CryptoCoinTimeline";
import CryptoMarketCapLog from "./CryptoMarketCapLog";
import CryptoTopMovers from "./CryptoTopMovers";
import CryptoSidebarTicker from "./CryptoSidebarTicker";
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
  const tNav = useTranslations("tools.crypto-converter.nav");
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

  function handleClear() {
    setFromCoinId("bitcoin");
    setToCoinId("ethereum");
    setAmount("1");
    setFiatCurrency("usd");
  }

  /** Picking a coin from a list makes it the source; if it was the target, the pair swaps. */
  function handlePick(id: string) {
    if (id === toCoinId) setToCoinId(fromCoinId);
    setFromCoinId(id);
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }

  const fromCoin = findCoinById(coins, fromCoinId);
  const toCoin = findCoinById(coins, toCoinId);
  const amountValue = parseLocalizedNumber(amount);

  const convertedAmount = useMemo(() => {
    if (!fromCoin || !toCoin || Number.isNaN(amountValue)) return 0;
    return convertCryptoAmount(amountValue, fromCoin.currentPrice, toCoin.currentPrice);
  }, [amountValue, fromCoin, toCoin]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "chart", label: tNav("chart") },
    { id: "compare", label: tNav("coin") },
    { id: "movers", label: tNav("market") },
    { id: "fear-greed", label: tNav("network") },
    { id: "news", label: tNav("news") },
    { id: "learning-resources", label: tNav("education") },
    { id: "faq", label: tNav("faq") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
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
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-4">
              <CryptoResult
                fromCoin={fromCoin}
                toCoin={toCoin}
                amount={amount}
                convertedAmount={convertedAmount}
                fiatCurrency={fiatCurrency}
                onFiatCurrencyChange={setFiatCurrency}
                usdToSarRate={usdToSarRate}
                lastUpdated={fetchedAt}
                digitStyle={digitStyle}
              />
              <CryptoLiveFlow fromCoin={fromCoin} toCoin={toCoin} amount={amountValue} digitStyle={digitStyle} />
              {globalStats && <CryptoDominanceDonut stats={globalStats} fromCoin={fromCoin} toCoin={toCoin} digitStyle={digitStyle} />}
            </div>
          }
          sidebar={
            <div className="flex flex-col gap-6">
              <RelatedToolsSidebar currentSlug="crypto-converter" category="financial-markets" />
              <CryptoSidebarTicker coins={initialCoins} digitStyle={digitStyle} onPick={handlePick} />
            </div>
          }
          sidebarFill={
            <div className="sticky top-20">
              <AdSpace />
            </div>
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="crypto-converter" />

              {/* Group 1 — the selected coin's price action */}
              <CryptoHistoricalChart coin={fromCoin} digitStyle={digitStyle} />
              <CryptoVolatilityGauge coin={fromCoin} digitStyle={digitStyle} />
              <CryptoSensitivityTrio fromCoin={fromCoin} toCoin={toCoin} amount={amountValue} digitStyle={digitStyle} />
              <AdSpace variant="leaderboard" />

              {/* Group 2 — the coin itself */}
              <CryptoComparisonCards fromCoin={fromCoin} toCoin={toCoin} digitStyle={digitStyle} />
              <CryptoSupplyBar coin={fromCoin} digitStyle={digitStyle} />
              <CryptoCoinTimeline coin={fromCoin} digitStyle={digitStyle} />
              <CryptoMarketCapLog coins={initialCoins} coin={fromCoin} digitStyle={digitStyle} />
              <AdSpace variant="leaderboard" />

              {/* Group 3 — the whole market */}
              <CryptoTopMovers coins={initialCoins} digitStyle={digitStyle} onPick={handlePick} />
              <CryptoTopList
                coins={initialCoins}
                fiatCurrency={fiatCurrency}
                usdToSarRate={usdToSarRate}
                digitStyle={digitStyle}
                fromCoinId={fromCoinId}
                toCoinId={toCoinId}
                onPick={handlePick}
              />
              <AdSpace variant="leaderboard" />

              {/* Group 4 — sentiment and the Bitcoin network */}
              <CryptoFearGreed />
              <CryptoNetworkFees btcPriceUsd={findCoinById(coins, "bitcoin")?.currentPrice ?? null} digitStyle={digitStyle} />
              <CryptoHalvingSteps />
              <AdSpace variant="leaderboard" />

              <CryptoWhatIfCalculator coins={coins} onCoinDiscovered={handleCoinDiscovered} digitStyle={digitStyle} />
              <CryptoNews />
              <CryptoLearningResources />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
