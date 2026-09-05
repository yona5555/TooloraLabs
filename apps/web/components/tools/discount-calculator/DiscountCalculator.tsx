"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { DiscountCalculator as DiscountCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import DiscountInputPanel from "./DiscountInputPanel";
import DiscountResult from "./DiscountResult";
import DiscountStackingReference from "./DiscountStackingReference";
import DiscountLiveWaterfallDiagram from "./DiscountLiveWaterfallDiagram";
import DiscountSavingsScalingDiagram from "./DiscountSavingsScalingDiagram";
import type { DiscountMode, DiscountResult as Result } from "./types";

const tool = new DiscountCalculatorTool();

const APPLY_DEFAULTS = { price: "120", discounts: ["30", "10"] };
const REVERSE_DEFAULTS = { price: "84", discounts: ["30"] };

type ComputeOutcome = { result: Result | null; errorKey: string };

function computeResult(mode: DiscountMode, price: string, discounts: string[]): ComputeOutcome {
  const priceValue = parseLocalizedNumber(price);
  const discountValues = discounts.map((d) => parseLocalizedNumber(d));

  if (Number.isNaN(priceValue) || priceValue < 0 || discountValues.some((d) => Number.isNaN(d) || d < 0)) {
    return { result: null, errorKey: "required" };
  }

  const output = tool.execute(
    { mode, originalPrice: mode === "apply" ? priceValue : 0, finalPrice: mode === "reverse" ? priceValue : 0, discounts: discountValues },
    { locale: "en-US" }
  );
  return { result: output.data, errorKey: "" };
}

function getDefaultResult(): ComputeOutcome {
  return computeResult("apply", APPLY_DEFAULTS.price, APPLY_DEFAULTS.discounts);
}

export default function DiscountCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.discount-calculator");
  const tErrors = useTranslations("tools.discount-calculator.errors");
  const tNav = useTranslations("tools.discount-calculator.nav");

  const [mode, setMode] = useState<DiscountMode>("apply");
  const [price, setPrice] = useState(APPLY_DEFAULTS.price);
  const [discounts, setDiscounts] = useState<string[]>(APPLY_DEFAULTS.discounts);

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

  function handleModeChange(next: DiscountMode) {
    if (next === mode) return;
    setMode(next);
    const defaults = next === "reverse" ? REVERSE_DEFAULTS : APPLY_DEFAULTS;
    setPrice(defaults.price);
    setDiscounts(defaults.discounts);
    setOutcome(computeResult(next, defaults.price, defaults.discounts));
    setHasCalculated(true);
  }

  function performCalculate(options: { updateUrl: boolean }) {
    const next = computeResult(mode, price, discounts);
    setOutcome(next);
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(price, ...discounts));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("price", price);
      discounts.forEach((d, i) => params.set(`d${i}`, d));
      params.set("currency", currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate({ updateUrl: true });
  }

  function handleClear() {
    const defaults = mode === "reverse" ? REVERSE_DEFAULTS : APPLY_DEFAULTS;
    setPrice(defaults.price);
    setDiscounts(defaults.discounts);
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
      setOutcome(computeResult(mode, convertedPrice, discounts));
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

  const waterfallStages =
    result && result.mode === "apply" && result.discounts.length > 1
      ? (() => {
          let running = result.originalPrice;
          const stages = [{ label: t("waterfallDiagram.start"), price: running }];
          result.discounts.forEach((d, i) => {
            running = running * (1 - d / 100);
            stages.push({ label: t("waterfallDiagram.afterStage", { stage: i + 1 }), price: running });
          });
          return stages;
        })()
      : null;

  const scalingPoints =
    result && result.effectiveDiscountPercent > 0
      ? [0.5, 0.75, 1, 1.5, 2, 3].map((factor) => {
          const testPrice = Math.max(result.originalPrice, 1) * factor;
          return { price: testPrice, saved: testPrice * (result.effectiveDiscountPercent / 100) };
        })
      : null;

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <DiscountInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              price={price}
              onPriceChange={setPrice}
              discounts={discounts}
              onDiscountsChange={setDiscounts}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<DiscountResult result={result} hasCalculated={hasCalculated} errorMessage={errorMessage} digitStyle={digitStyle} currency={currency} />}
          sidebar={<RelatedToolsSidebar currentSlug="discount-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="discount-calculator" />

              {hasCalculated && waterfallStages && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("waterfallDiagram.title")}</h3>
                  <DiscountLiveWaterfallDiagram stages={waterfallStages} formatValue={money} caption={t("waterfallDiagram.caption")} />
                </div>
              )}

              {hasCalculated && scalingPoints && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("scalingDiagram.title")}</h3>
                  <DiscountSavingsScalingDiagram
                    points={scalingPoints}
                    currentPrice={result?.originalPrice ?? 0}
                    caption={t("scalingDiagram.caption")}
                    xLabel={t("scalingDiagram.xLabel")}
                  />
                </div>
              )}

              <DiscountStackingReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
