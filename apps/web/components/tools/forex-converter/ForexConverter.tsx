"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCurrencyAmount, findCurrencyByCode, type CurrencyRate } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ForexInputPanel from "./ForexInputPanel";
import ForexResult from "./ForexResult";
import ForexDisclaimer from "./ForexDisclaimer";
import ForexTopList from "./ForexTopList";
import ForexHistoricalChart from "./ForexHistoricalChart";
import ForexNews from "./ForexNews";
import ForexLearningResources from "./ForexLearningResources";
import type { ReactNode } from "react";

type ForexConverterProps = {
  initialCurrencies: CurrencyRate[];
  lastUpdatedUnix: number;
  education: ReactNode;
};

export default function ForexConverter({ initialCurrencies, lastUpdatedUnix, education }: ForexConverterProps) {
  const tNav = useTranslations("tools.forex-converter.nav");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("SAR");
  const [amount, setAmount] = useState("1");

  const digitStyle: DigitStyle = resolveDigitStyle(amount);

  function handleSwap() {
    setFromCode(toCode);
    setToCode(fromCode);
  }

  const fromCurrency = findCurrencyByCode(initialCurrencies, fromCode);
  const toCurrency = findCurrencyByCode(initialCurrencies, toCode);

  const convertedAmount = useMemo(() => {
    const amountValue = parseLocalizedNumber(amount);
    if (!fromCurrency || !toCurrency || Number.isNaN(amountValue)) return 0;
    return convertCurrencyAmount(amountValue, fromCurrency.ratePerUsd, toCurrency.ratePerUsd);
  }, [amount, fromCurrency, toCurrency]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "news", label: tNav("news") },
    { id: "learning-resources", label: tNav("education") },
    { id: "faq", label: tNav("faq") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <ForexInputPanel
              currencies={initialCurrencies}
              amount={amount}
              onAmountChange={setAmount}
              fromCode={fromCode}
              onFromChange={setFromCode}
              toCode={toCode}
              onToChange={setToCode}
              onSwap={handleSwap}
            />
          }
          result={
            <ForexResult
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
              convertedAmount={convertedAmount}
              lastUpdatedUnix={lastUpdatedUnix}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="forex-converter" category="financial-markets" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ForexDisclaimer />
              <ForexTopList currencies={initialCurrencies} digitStyle={digitStyle} />
              <ForexHistoricalChart digitStyle={digitStyle} />
              <ForexNews />
              <ForexLearningResources />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
