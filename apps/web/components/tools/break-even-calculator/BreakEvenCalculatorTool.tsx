"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { BreakEvenCalculator, type BreakEvenOutput } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import BreakEvenModeTabs from "./BreakEvenModeTabs";
import BreakEvenInputPanel from "./BreakEvenInputPanel";
import BreakEvenResult from "./BreakEvenResult";
import BreakEvenReference from "./BreakEvenReference";
import BreakEvenSensitivityDiagram from "./BreakEvenSensitivityDiagram";
import type { BreakEvenMode } from "./types";

const tool = new BreakEvenCalculator();

const DEFAULTS = { fixedCosts: "5000", variableCostPerUnit: "20", pricePerUnit: "45", targetProfit: "10000" };

type Inputs = typeof DEFAULTS;
type ComputeOutcome = { result: BreakEvenOutput | null; errorKey: string };

function computeResult(targetMode: BreakEvenMode, inputs: Inputs): ComputeOutcome {
  const parsedFixedCosts = parseLocalizedNumber(inputs.fixedCosts);
  const parsedVariableCost = parseLocalizedNumber(inputs.variableCostPerUnit);
  const parsedPrice = parseLocalizedNumber(inputs.pricePerUnit);
  const parsedTargetProfit = parseLocalizedNumber(inputs.targetProfit);

  if (Number.isNaN(parsedFixedCosts) || Number.isNaN(parsedVariableCost) || Number.isNaN(parsedPrice)) {
    return { result: null, errorKey: "required" };
  }
  if (targetMode === "targetProfit" && (Number.isNaN(parsedTargetProfit) || parsedTargetProfit <= 0)) {
    return { result: null, errorKey: "required" };
  }

  const output = tool.execute(
    {
      fixedCosts: parsedFixedCosts,
      variableCostPerUnit: parsedVariableCost,
      pricePerUnit: parsedPrice,
      targetProfit: targetMode === "targetProfit" && !Number.isNaN(parsedTargetProfit) ? parsedTargetProfit : undefined,
    },
    { locale: "en-US" }
  );

  if (!output.success) {
    const key = output.metadata.error === "NO_BREAK_EVEN" ? "noBreakEven" : "invalidValues";
    return { result: null, errorKey: key };
  }

  return { result: output.data, errorKey: "" };
}

export default function BreakEvenCalculatorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.break-even-calculator.errors");
  const t2 = useTranslations("tools.break-even-calculator");
  const tNav = useTranslations("tools.break-even-calculator.nav");

  const [mode, setMode] = useState<BreakEvenMode>("breakEven");

  const [fixedCosts, setFixedCosts] = useState(DEFAULTS.fixedCosts);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(DEFAULTS.variableCostPerUnit);
  const [pricePerUnit, setPricePerUnit] = useState(DEFAULTS.pricePerUnit);
  const [targetProfit, setTargetProfit] = useState(DEFAULTS.targetProfit);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [breakEvenOutcome, setBreakEvenOutcome] = useState<ComputeOutcome>(() => computeResult("breakEven", DEFAULTS));
  const [targetProfitOutcome, setTargetProfitOutcome] = useState<ComputeOutcome>({ result: null, errorKey: "" });
  const [hasCalculated, setHasCalculated] = useState<Record<BreakEvenMode, boolean>>({ breakEven: true, targetProfit: false });
  const [initializedModes, setInitializedModes] = useState<Record<BreakEvenMode, boolean>>({ breakEven: true, targetProfit: false });

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  // Same dual-observer hysteresis technique validated on Compound Interest/Loan Calculator: two
  // margins (a deeper "show" line, a shallower "hide" line) create a dead zone so momentum-
  // scroll jitter near either line can't flip visibility back and forth every frame.
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

  function performCalculate(targetMode: BreakEvenMode, options: { updateUrl: boolean }) {
    const inputs: Inputs = { fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit };
    const outcome = computeResult(targetMode, inputs);

    if (targetMode === "breakEven") {
      setBreakEvenOutcome(outcome);
    } else {
      setTargetProfitOutcome(outcome);
    }

    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(resolveDigitStyle(fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set("mode", targetMode);
      params.set("fixed", fixedCosts);
      params.set("variable", variableCostPerUnit);
      params.set("price", pricePerUnit);
      params.set("profit", targetProfit);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  function handleModeChange(newMode: BreakEvenMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  function handleClear() {
    setFixedCosts(DEFAULTS.fixedCosts);
    setVariableCostPerUnit(DEFAULTS.variableCostPerUnit);
    setPricePerUnit(DEFAULTS.pricePerUnit);
    setTargetProfit(DEFAULTS.targetProfit);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately and recomputes every mode visited so far, matching the pattern used
  // by every other currency-aware tool on the site.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);
    const convertedFixedCosts = convert(fixedCosts);
    const convertedVariableCost = convert(variableCostPerUnit);
    const convertedPrice = convert(pricePerUnit);
    const convertedTargetProfit = convert(targetProfit);

    setFixedCosts(convertedFixedCosts);
    setVariableCostPerUnit(convertedVariableCost);
    setPricePerUnit(convertedPrice);
    setTargetProfit(convertedTargetProfit);
    setCurrency(next);

    const convertedInputs: Inputs = {
      fixedCosts: convertedFixedCosts,
      variableCostPerUnit: convertedVariableCost,
      pricePerUnit: convertedPrice,
      targetProfit: convertedTargetProfit,
    };
    if (initializedModes.breakEven) setBreakEvenOutcome(computeResult("breakEven", convertedInputs));
    if (initializedModes.targetProfit) setTargetProfitOutcome(computeResult("targetProfit", convertedInputs));
  }

  const activeOutcome = mode === "breakEven" ? breakEvenOutcome : targetProfitOutcome;
  const errorMessage = activeOutcome.errorKey ? t(activeOutcome.errorKey) : "";

  const activePricePerUnit = parseLocalizedNumber(pricePerUnit) || 0;
  const activeVariableCost = parseLocalizedNumber(variableCostPerUnit) || 0;
  const activeFixedCosts = parseLocalizedNumber(fixedCosts) || 0;
  const sensitivityPoints =
    activeOutcome.result && activePricePerUnit > activeVariableCost
      ? [0.7, 0.85, 1, 1.15, 1.3, 1.5].map((factor) => {
          const testPrice = activePricePerUnit * factor;
          const margin = testPrice - activeVariableCost;
          return { price: testPrice, units: margin > 0 ? Math.ceil(activeFixedCosts / margin) : 0 };
        })
      : null;

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <BreakEvenInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              fixedCosts={fixedCosts}
              onFixedCostsChange={setFixedCosts}
              variableCostPerUnit={variableCostPerUnit}
              onVariableCostPerUnitChange={setVariableCostPerUnit}
              pricePerUnit={pricePerUnit}
              onPricePerUnitChange={setPricePerUnit}
              targetProfit={targetProfit}
              onTargetProfitChange={setTargetProfit}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <BreakEvenResult
                mode={mode}
                hasCalculated={hasCalculated[mode]}
                result={activeOutcome.result}
                errorMessage={errorMessage}
                digitStyle={digitStyle}
                currency={currency}
                fixedCosts={activeFixedCosts}
                variableCostPerUnit={activeVariableCost}
                pricePerUnit={activePricePerUnit}
                targetProfit={parseLocalizedNumber(targetProfit) || 0}
              />
              <BreakEvenModeTabs mode={mode} onModeChange={handleModeChange} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="break-even-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="break-even-calculator" />

              {hasCalculated[mode] && sensitivityPoints && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t2("sensitivityDiagram.title")}</h3>
                  <BreakEvenSensitivityDiagram
                    points={sensitivityPoints}
                    currentPrice={activePricePerUnit}
                    caption={t2("sensitivityDiagram.caption")}
                    xLabel={t2("sensitivityDiagram.xLabel")}
                  />
                </div>
              )}

              <BreakEvenReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
