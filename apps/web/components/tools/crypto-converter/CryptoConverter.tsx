"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { findCoinById, type CryptoCoin, type CryptoGlobalStats } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import CryptoInputPanel from "./CryptoInputPanel";
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
import CryptoNews from "./CryptoNews";
import CryptoLearningResources from "./CryptoLearningResources";
import CryptoPhoneTicker, { type PhoneTrends } from "./CryptoPhoneTicker";
import { FiatContext, marketFormatters, useFiatPreference } from "@/components/tools/markets/fiat";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import { useLiveTicks } from "./useCryptoLive";
import type { FiatRate } from "./types";
import { Fragment, type ReactNode } from "react";

type CryptoConverterProps = {
  initialCoins: CryptoCoin[];
  globalStats: CryptoGlobalStats | null;
  fiatRates: FiatRate[];
  fetchedAt: number;
  education: ReactNode;
  phoneTrends: PhoneTrends;
};

const FIAT_STORAGE_KEY = "crypto-converter:fiat";


export default function CryptoConverter({ initialCoins, globalStats, fiatRates, fetchedAt, education, phoneTrends }: CryptoConverterProps) {
  const t = useTranslations("tools.crypto-converter");
  const tNav = useTranslations("tools.crypto-converter.nav");
  const [coins, setCoins] = useState<CryptoCoin[]>(initialCoins);
  const [fromCoinId, setFromCoinId] = useState("bitcoin");
  const [toCoinId, setToCoinId] = useState("ethereum");
  const [chartCoinId, setChartCoinId] = useState("bitcoin");
  const [amount, setAmount] = useState("1");
  const [fiat, handleFiatChange] = useFiatPreference(FIAT_STORAGE_KEY, fiatRates);
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
  }

  /** Picking a coin from a list makes it the source; if it was the target, the pair swaps. */
  function pickFrom(id: string) {
    if (id === toCoinId) setToCoinId(fromCoinId);
    setFromCoinId(id);
  }

  function handlePick(id: string) {
    pickFrom(id);
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }

  const fromCoin = findCoinById(coins, fromCoinId);
  const toCoin = findCoinById(coins, toCoinId);
  const chartCoin = findCoinById(coins, chartCoinId);
  const amountValue = parseLocalizedNumber(amount);

  // One live feed for the pair, shared by the quick-conversion table and the Live Conversion Flow.
  const ticks = useLiveTicks([fromCoin?.symbol ?? "", toCoin?.symbol ?? ""].filter(Boolean));
  const livePrice = (c: CryptoCoin | undefined) => (c ? (ticks[c.symbol.toUpperCase()]?.price ?? c.currentPrice) : null);
  const fromPrice = livePrice(fromCoin);
  const toPrice = livePrice(toCoin);

  // Most-traded coins fill the column under the related tools, so the top area has no empty space.
  const f = marketFormatters(digitStyle, fiat);
  const sidebarRows = [...initialCoins]
    .filter((c) => c.totalVolume)
    .sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0))
    .slice(0, 30)
    .map((c) => ({
      id: c.id,
      label: c.name,
      sub: c.symbol,
      value: f.compactMoney(c.totalVolume ?? 0),
      change: c.priceChangePercentage24h,
      changeText: c.priceChangePercentage24h == null ? undefined : f.signedPct(c.priceChangePercentage24h, 1),
    }));

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

  // Below the fold, in page order; `adAfter` = the desktop leaderboard that follows it (unchanged).
  const belowCards: { key: string; node: ReactNode; adAfter?: boolean }[] = [
    { key: "chart", node: <CryptoHistoricalChart coin={chartCoin} coins={initialCoins} onSelectCoin={setChartCoinId} digitStyle={digitStyle} /> },
    { key: "volatility", node: <CryptoVolatilityGauge coin={fromCoin} digitStyle={digitStyle} /> },
    { key: "sensitivity", node: <CryptoSensitivityTrio fromCoin={fromCoin} toCoin={toCoin} amount={amountValue} digitStyle={digitStyle} />, adAfter: true },
    { key: "compare", node: <CryptoComparisonCards fromCoin={fromCoin} toCoin={toCoin} digitStyle={digitStyle} /> },
    { key: "supply", node: <CryptoSupplyBar coin={fromCoin} digitStyle={digitStyle} /> },
    { key: "timeline", node: <CryptoCoinTimeline coin={fromCoin} digitStyle={digitStyle} /> },
    { key: "mcap", node: <CryptoMarketCapLog coins={initialCoins} coin={fromCoin} digitStyle={digitStyle} />, adAfter: true },
    { key: "movers", node: <CryptoTopMovers coins={initialCoins} digitStyle={digitStyle} onPick={handlePick} /> },
    { key: "toplist", node: <CryptoTopList coins={initialCoins} digitStyle={digitStyle} fromCoinId={fromCoinId} toCoinId={toCoinId} onPick={handlePick} />, adAfter: true },
    { key: "fear-greed", node: <CryptoFearGreed /> },
    { key: "fees", node: <CryptoNetworkFees btcPriceUsd={findCoinById(coins, "bitcoin")?.currentPrice ?? null} digitStyle={digitStyle} /> },
    { key: "halving", node: <CryptoHalvingSteps />, adAfter: true },
    { key: "what-if", node: <CryptoWhatIfCalculator coins={coins} onCoinDiscovered={handleCoinDiscovered} digitStyle={digitStyle} /> },
    { key: "news", node: <CryptoNews /> },
    { key: "learning", node: <CryptoLearningResources /> },
  ];

  return (
    <FiatContext.Provider value={fiat}>
      <CryptoPhoneTicker coins={initialCoins} trends={phoneTrends} fromCoinId={fromCoinId} onPick={pickFrom} />
      {/* Agreed top-of-page layout: input | result | related tools + 300×600 ad (hidden on mobile). */}
      <div id="tool" className="scroll-mt-32 max-md:[&_[data-tool-result]]:contents">
        <ToolAboveFold
          stretchInput
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
              fiatRates={fiatRates}
              fiatCode={fiat.code}
              onFiatChange={handleFiatChange}
              fromPrice={fromPrice}
              toPrice={toPrice}
              fromCoin={fromCoin}
              toCoin={toCoin}
              digitStyle={digitStyle}
            />
          }
          result={
            // Phone only (approved exception to "input first", Yousef 2026-10-23): the live flow card
            // (`live-output`) comes above the input card, the dominance card below it (globals.css).
            <div className="flex flex-col gap-6">
              <CryptoLiveFlow
                fromCoin={fromCoin}
                toCoin={toCoin}
                amountText={amount}
                amount={amountValue}
                ticks={ticks}
                lastUpdated={fetchedAt}
                digitStyle={digitStyle}
              />
              {globalStats && <CryptoDominanceDonut stats={globalStats} fromCoin={fromCoin} toCoin={toCoin} digitStyle={digitStyle} />}
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="crypto-converter"
              category="financial-markets"
              relatedList={["forex-converter", "commodities-tracker", "compound-interest-calculator", "retirement-calculator"]}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          sidebarFill={<SidebarFillList title={t("sidebarVolume.title", { currency: fiat.code })} note={t("sidebarVolume.note")} rows={sidebarRows} />}
        />
      </div>

      {/* Below the fold every card spans the full content width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="crypto-converter" />

        {belowCards.map((card) => (
          <Fragment key={card.key}>
            {card.node}
            {card.adAfter && <AdSpace variant="leaderboard" />}
          </Fragment>
        ))}
      </div>

      {education}
    </FiatContext.Provider>
  );
}
