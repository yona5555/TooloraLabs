"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { crossSeries, findCurrencyByCode, type CurrencyRate } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import { FiatContext, marketFormatters, useFiatPreference, type FiatRate } from "@/components/tools/markets/fiat";
import ForexInputPanel from "./ForexInputPanel";
import ForexLiveFlow from "./ForexLiveFlow";
import ForexEquivalence from "./ForexEquivalence";
import ForexTerminal from "./ForexTerminal";
import {
  ForexComparisonCards,
  ForexPairTimeline,
  ForexPeriodReturns,
  ForexRangeStrip,
  ForexSensitivityTrio,
  ForexVolatilityGauge,
  ForexYearlySteps,
} from "./ForexPairIndicators";
import { ForexCrossRates, ForexStrengthMeter, ForexTopList, ForexTopMovers } from "./ForexMarketIndicators";
import ForexNews from "./ForexNews";
import ForexLearningResources from "./ForexLearningResources";
import { useCurrencyName, useForexRecent, usePairHistory } from "./useForexData";
import { ForexPairContext } from "./forexPairContext";
import type { ReactNode } from "react";

type ForexConverterProps = {
  initialCurrencies: CurrencyRate[];
  lastUpdatedUnix: number | null;
  education: ReactNode;
};

const FIAT_STORAGE_KEY = "forex-converter:fiat";
const SIDEBAR_CODES = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "INR", "SAR", "AED", "KWD", "QAR", "EGP", "MAD", "TRY", "MXN", "BRL", "ZAR", "SGD", "HKD", "KRW", "SEK", "NOK", "NZD"];

export default function ForexConverter({ initialCurrencies, lastUpdatedUnix, education }: ForexConverterProps) {
  const t = useTranslations("tools.forex-converter");
  const tNav = useTranslations("tools.forex-converter.nav");
  const dataUnavailable = initialCurrencies.length === 0;
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [chartPair, setChartPair] = useState<[string, string]>(["EUR", "USD"]);
  // Every currency the rate provider quotes can be the display currency (units per USD = its rate).
  const fiatRates: FiatRate[] = useMemo(() => initialCurrencies.map((c) => ({ code: c.code, name: c.name, perUsd: c.ratePerUsd })), [initialCurrencies]);
  const [fiat, handleFiatChange] = useFiatPreference(FIAT_STORAGE_KEY, fiatRates);
  const digitStyle: DigitStyle = resolveDigitStyle(amount);
  const name = useCurrencyName();

  const recent = useForexRecent();
  const history = usePairHistory(fromCode, toCode);

  function handleSwap() {
    setFromCode(toCode);
    setToCode(fromCode);
  }

  function handleClear() {
    setFromCode("USD");
    setToCode("EUR");
    setAmount("1");
  }

  /** Picking a currency from a list makes it the source; if it was the target, the pair swaps. */
  function handlePick(code: string) {
    if (code === toCode) setToCode(fromCode);
    setFromCode(code);
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }

  const fromCurrency = findCurrencyByCode(initialCurrencies, fromCode);
  const toCurrency = findCurrencyByCode(initialCurrencies, toCode);
  const amountValue = parseLocalizedNumber(amount);
  const pairProps = { fromCurrency, toCurrency, digitStyle };

  const f = marketFormatters(digitStyle, fiat);
  const sidebarRows = SIDEBAR_CODES.filter((c) => c !== fiat.code).flatMap((code) => {
    const c = findCurrencyByCode(initialCurrencies, code);
    if (!c) return [];
    const s = recent.status === "ready" ? crossSeries(recent.data, code, "USD") : [];
    const change = s.length > 1 ? (s[s.length - 1].rate / s[s.length - 2].rate - 1) * 100 : null;
    return [{ id: code, label: name(code, c.name), sub: code, value: f.money(1 / c.ratePerUsd), change, changeText: change === null ? undefined : f.signedPct(change) }];
  });

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "chart", label: tNav("chart") },
    { id: "compare", label: tNav("pair") },
    { id: "strength", label: tNav("market") },
    { id: "news", label: tNav("news") },
    { id: "learning-resources", label: tNav("education") },
    { id: "faq", label: tNav("faq") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <FiatContext.Provider value={fiat}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <ForexInputPanel
              currencies={initialCurrencies}
              dataUnavailable={dataUnavailable}
              amount={amount}
              onAmountChange={setAmount}
              fromCode={fromCode}
              onFromChange={setFromCode}
              toCode={toCode}
              onToChange={setToCode}
              onSwap={handleSwap}
              onClear={handleClear}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
              fiatRates={fiatRates}
              fiatCode={fiat.code}
              onFiatChange={handleFiatChange}
              digitStyle={digitStyle}
            />
          }
          result={
            <div className="flex flex-col gap-6">
              <ForexLiveFlow
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                amountText={amount}
                amount={amountValue}
                lastUpdatedUnix={lastUpdatedUnix}
                recent={recent}
                digitStyle={digitStyle}
              />
              <ForexEquivalence currencies={initialCurrencies} fromCurrency={fromCurrency} amount={amountValue} digitStyle={digitStyle} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="forex-converter"
              category="financial-markets"
              relatedList={["crypto-converter", "commodities-tracker", "compound-interest-calculator", "loan-calculator"]}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          sidebarFill={<SidebarFillList title={t("sidebarRates.title", { currency: fiat.code })} note={t("sidebarRates.note")} rows={sidebarRows} />}
        />
      </div>

      {/* Below the fold every card spans the full content width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="forex-converter" />

        {/* Group 1 — price action */}
        <ForexTerminal pair={chartPair} onSelectPair={setChartPair} converterPair={[fromCode, toCode]} recent={recent} digitStyle={digitStyle} />
        <ForexRangeStrip {...pairProps} history={history} />
        <ForexVolatilityGauge {...pairProps} recent={recent} />
        <ForexSensitivityTrio {...pairProps} amount={amountValue} />
        <AdSpace variant="leaderboard" />

        {/* Group 2 — the pair itself */}
        <ForexComparisonCards {...pairProps} recent={recent} history={history} />
        <ForexPairTimeline {...pairProps} history={history} />
        <ForexPeriodReturns {...pairProps} history={history} />
        <ForexYearlySteps {...pairProps} amount={amountValue} history={history} />
        <AdSpace variant="leaderboard" />

        {/* Group 3 — the whole market */}
        <ForexStrengthMeter recent={recent} highlight={[fromCode, toCode]} digitStyle={digitStyle} />
        <ForexTopMovers recent={recent} onPick={handlePick} digitStyle={digitStyle} />
        <ForexCrossRates currencies={initialCurrencies} fromCode={fromCode} toCode={toCode} digitStyle={digitStyle} />
        <ForexTopList currencies={initialCurrencies} fromCurrency={fromCurrency} amount={amountValue} digitStyle={digitStyle} />
        <AdSpace variant="leaderboard" />

        <ForexNews />
        <ForexLearningResources />
      </div>

      <ForexPairContext.Provider value={{ from: fromCode, to: toCode }}>{education}</ForexPairContext.Provider>
    </FiatContext.Provider>
  );
}
