"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { SalesTaxCalculator as SalesTaxCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SalesTaxInputPanel from "./SalesTaxInputPanel";
import SalesTaxResult from "./SalesTaxResult";
import SalesTaxRatesReference from "./SalesTaxRatesReference";
import SalesTaxRateComparisonBarDiagram from "./SalesTaxRateComparisonBarDiagram";
import SalesTaxTotalByRateDiagram from "./SalesTaxTotalByRateDiagram";
import type { SalesTaxMode, SalesTaxResult as Result } from "./types";

const tool = new SalesTaxCalculatorTool();

const ADD_DEFAULTS = { price: "100", taxRate: "8" };
const REVERSE_DEFAULTS = { price: "108", taxRate: "8" };

type ComputeOutcome = { result: Result | null; errorKey: string };

function computeResult(mode: SalesTaxMode, price: string, taxRate: string): ComputeOutcome {
  const priceValue = parseLocalizedNumber(price);
  const rateValue = parseLocalizedNumber(taxRate);

  if (Number.isNaN(priceValue) || priceValue < 0 || Number.isNaN(rateValue) || rateValue < 0) {
    return { result: null, errorKey: "required" };
  }

  const output = tool.execute(
    { mode, price: mode === "add" ? priceValue : 0, totalPrice: mode === "reverse" ? priceValue : 0, taxRate: rateValue },
    { locale: "en-US" }
  );
  return { result: output.data, errorKey: "" };
}

function getDefaultResult(): ComputeOutcome {
  return computeResult("add", ADD_DEFAULTS.price, ADD_DEFAULTS.taxRate);
}

export default function SalesTaxCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.sales-tax-calculator");
  const tErrors = useTranslations("tools.sales-tax-calculator.errors");
  const tNav = useTranslations("tools.sales-tax-calculator.nav");

  const [mode, setMode] = useState<SalesTaxMode>("add");
  const [price, setPrice] = useState(ADD_DEFAULTS.price);
  const [taxRate, setTaxRate] = useState(ADD_DEFAULTS.taxRate);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [outcome, setOutcome] = useState<ComputeOutcome>(getDefaultResult);
  const [hasCalculated, setHasCalculated] = useState(true);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerSentinelRef.current;
    if (!el) return;

    let isVisible = false;

    const showObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !isVisible) {
          isVisible = true;
          setNavBarVisible(true);
        }
      },
      { rootMargin: "-88px 0px 0px 0px", threshold: 0 }
    );
    const hideObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isVisible) {
          isVisible = false;
          setNavBarVisible(false);
        }
      },
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 }
    );

    showObserver.observe(el);
    hideObserver.observe(el);
    return () => {
      showObserver.disconnect();
      hideObserver.disconnect();
    };
  }, []);

  function handleModeChange(next: SalesTaxMode) {
    if (next === mode) return;
    setMode(next);
    const defaults = next === "reverse" ? REVERSE_DEFAULTS : ADD_DEFAULTS;
    setPrice(defaults.price);
    setTaxRate(defaults.taxRate);
    setOutcome(computeResult(next, defaults.price, defaults.taxRate));
    setHasCalculated(true);
  }

  function performCalculate(options: { updateUrl: boolean }) {
    const next = computeResult(mode, price, taxRate);
    setOutcome(next);
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(price, taxRate));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("price", price);
      params.set("rate", taxRate);
      params.set("currency", currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate({ updateUrl: true });
  }

  function handleClear() {
    const defaults = mode === "reverse" ? REVERSE_DEFAULTS : ADD_DEFAULTS;
    setPrice(defaults.price);
    setTaxRate(defaults.taxRate);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setHasCalculated(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convertedPrice = convertAmountString(price, currency, next, (raw) => parseLocalizedNumber(raw) || 0);
    setPrice(convertedPrice);
    setCurrency(next);

    if (hasCalculated) {
      setOutcome(computeResult(mode, convertedPrice, taxRate));
    }
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const errorMessage = outcome.errorKey ? tErrors(outcome.errorKey) : "";
  const result = outcome.result;

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const comparisonBars =
    result &&
    [0, 3, 6, result.taxRate, 10].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b).map((rate) => ({
      label: `${rate}%`,
      value: result.price * (1 + rate / 100),
      highlighted: rate === result.taxRate,
    }));

  const totalByRatePoints =
    result &&
    [0, 2, 4, 6, 8, 10, 12].map((rate) => ({ rate, total: result.price * (1 + rate / 100) }));

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <SalesTaxInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              price={price}
              onPriceChange={setPrice}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<SalesTaxResult result={result} hasCalculated={hasCalculated} errorMessage={errorMessage} digitStyle={digitStyle} currency={currency} />}
          sidebar={<RelatedToolsSidebar currentSlug="sales-tax-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="sales-tax-calculator" />

              {hasCalculated && comparisonBars && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("comparisonDiagram.title")}</h3>
                  <SalesTaxRateComparisonBarDiagram bars={comparisonBars} formatValue={money} caption={t("comparisonDiagram.caption")} />
                </div>
              )}

              {hasCalculated && totalByRatePoints && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("totalByRateDiagram.title")}</h3>
                  <SalesTaxTotalByRateDiagram points={totalByRatePoints} currentRate={result?.taxRate ?? 0} caption={t("totalByRateDiagram.caption")} xLabel={t("totalByRateDiagram.xLabel")} />
                </div>
              )}

              <SalesTaxRatesReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
