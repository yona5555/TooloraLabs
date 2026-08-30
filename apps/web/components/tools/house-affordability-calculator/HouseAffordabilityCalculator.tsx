"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateHouseAffordability,
  calculateRequiredIncome,
  type HouseAffordabilityResult as HomePriceResult,
  type RequiredIncomeResult,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import HouseAffordabilityModeTabs from "./HouseAffordabilityModeTabs";
import HouseAffordabilityInputPanel from "./HouseAffordabilityInputPanel";
import HouseAffordabilityResult from "./HouseAffordabilityResult";
import type { HouseAffordabilityMode } from "./types";

/** Consumer mortgages rarely run longer than this; also bounds worst-case computation cost. */
const MAX_LOAN_TERM_YEARS = 50;

const DEFAULTS = {
  annualIncome: "90000",
  targetHomePrice: "400000",
  monthlyDebts: "400",
  downPayment: "40000",
  interestRate: "6.5",
  loanTermYears: "30",
  propertyTaxRate: "1.2",
  annualHomeInsurance: "1500",
  monthlyHOA: "0",
};

const EMPTY_REQUIRED_INCOME: RequiredIncomeResult = {
  requiredAnnualIncome: 0,
  loanAmount: 0,
  monthlyPayment: 0,
  monthlyPrincipalAndInterest: 0,
  monthlyPropertyTax: 0,
  monthlyInsurance: 0,
  bindingConstraint: "frontEnd",
};

const QUERY_PARAM_KEYS = {
  mode: "mode",
  income: "income",
  targetPrice: "price",
  debts: "debts",
  down: "down",
  rate: "rate",
  term: "term",
  tax: "tax",
  insurance: "insurance",
  hoa: "hoa",
} as const;

type Inputs = typeof DEFAULTS;

function computeHomePriceResult(inputs: Inputs): HomePriceResult {
  return calculateHouseAffordability(
    parseLocalizedNumber(inputs.annualIncome) || 0,
    parseLocalizedNumber(inputs.monthlyDebts) || 0,
    parseLocalizedNumber(inputs.downPayment) || 0,
    parseLocalizedNumber(inputs.interestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.loanTermYears) || 0, 0), MAX_LOAN_TERM_YEARS),
    parseLocalizedNumber(inputs.propertyTaxRate) || 0,
    parseLocalizedNumber(inputs.annualHomeInsurance) || 0,
    parseLocalizedNumber(inputs.monthlyHOA) || 0
  );
}

function computeRequiredIncomeResult(inputs: Inputs): RequiredIncomeResult {
  return calculateRequiredIncome(
    parseLocalizedNumber(inputs.targetHomePrice) || 0,
    parseLocalizedNumber(inputs.monthlyDebts) || 0,
    parseLocalizedNumber(inputs.downPayment) || 0,
    parseLocalizedNumber(inputs.interestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.loanTermYears) || 0, 0), MAX_LOAN_TERM_YEARS),
    parseLocalizedNumber(inputs.propertyTaxRate) || 0,
    parseLocalizedNumber(inputs.annualHomeInsurance) || 0,
    parseLocalizedNumber(inputs.monthlyHOA) || 0
  );
}

export default function HouseAffordabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.house-affordability-calculator.nav");

  const [mode, setMode] = useState<HouseAffordabilityMode>("homePrice");

  const [annualIncome, setAnnualIncome] = useState(DEFAULTS.annualIncome);
  const [targetHomePrice, setTargetHomePrice] = useState(DEFAULTS.targetHomePrice);
  const [monthlyDebts, setMonthlyDebts] = useState(DEFAULTS.monthlyDebts);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [propertyTaxRate, setPropertyTaxRate] = useState(DEFAULTS.propertyTaxRate);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState(DEFAULTS.annualHomeInsurance);
  const [monthlyHOA, setMonthlyHOA] = useState(DEFAULTS.monthlyHOA);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  const [homePriceResult, setHomePriceResult] = useState<HomePriceResult>(() => computeHomePriceResult(DEFAULTS));
  const [requiredIncomeResult, setRequiredIncomeResult] = useState<RequiredIncomeResult>(EMPTY_REQUIRED_INCOME);
  const [hasCalculated, setHasCalculated] = useState<Record<HouseAffordabilityMode, boolean>>({ homePrice: true, requiredIncome: false });
  const [initializedModes, setInitializedModes] = useState<Record<HouseAffordabilityMode, boolean>>({ homePrice: true, requiredIncome: false });

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

  function performCalculate(targetMode: HouseAffordabilityMode, options: { updateUrl: boolean }) {
    const inputs: Inputs = { annualIncome, targetHomePrice, monthlyDebts, downPayment, interestRate, loanTermYears, propertyTaxRate, annualHomeInsurance, monthlyHOA };

    if (targetMode === "homePrice") {
      setHomePriceResult(computeHomePriceResult(inputs));
    } else {
      setRequiredIncomeResult(computeRequiredIncomeResult(inputs));
    }

    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(resolveDigitStyle(annualIncome, targetHomePrice, monthlyDebts, downPayment, interestRate, loanTermYears, propertyTaxRate, annualHomeInsurance, monthlyHOA));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set(QUERY_PARAM_KEYS.mode, targetMode);
      params.set(QUERY_PARAM_KEYS.income, annualIncome);
      params.set(QUERY_PARAM_KEYS.targetPrice, targetHomePrice);
      params.set(QUERY_PARAM_KEYS.debts, monthlyDebts);
      params.set(QUERY_PARAM_KEYS.down, downPayment);
      params.set(QUERY_PARAM_KEYS.rate, interestRate);
      params.set(QUERY_PARAM_KEYS.term, loanTermYears);
      params.set(QUERY_PARAM_KEYS.tax, propertyTaxRate);
      params.set(QUERY_PARAM_KEYS.insurance, annualHomeInsurance);
      params.set(QUERY_PARAM_KEYS.hoa, monthlyHOA);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  function handleModeChange(newMode: HouseAffordabilityMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  function handleClear() {
    setAnnualIncome(DEFAULTS.annualIncome);
    setTargetHomePrice(DEFAULTS.targetHomePrice);
    setMonthlyDebts(DEFAULTS.monthlyDebts);
    setDownPayment(DEFAULTS.downPayment);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setPropertyTaxRate(DEFAULTS.propertyTaxRate);
    setAnnualHomeInsurance(DEFAULTS.annualHomeInsurance);
    setMonthlyHOA(DEFAULTS.monthlyHOA);
    setDigitStyle("western");
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

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
            <HouseAffordabilityInputPanel
              mode={mode}
              annualIncome={annualIncome}
              onAnnualIncomeChange={setAnnualIncome}
              targetHomePrice={targetHomePrice}
              onTargetHomePriceChange={setTargetHomePrice}
              monthlyDebts={monthlyDebts}
              onMonthlyDebtsChange={setMonthlyDebts}
              downPayment={downPayment}
              onDownPaymentChange={setDownPayment}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              loanTermYears={loanTermYears}
              onLoanTermYearsChange={setLoanTermYears}
              propertyTaxRate={propertyTaxRate}
              onPropertyTaxRateChange={setPropertyTaxRate}
              annualHomeInsurance={annualHomeInsurance}
              onAnnualHomeInsuranceChange={setAnnualHomeInsurance}
              monthlyHOA={monthlyHOA}
              onMonthlyHOAChange={setMonthlyHOA}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <HouseAffordabilityResult
                mode={mode}
                hasCalculated={hasCalculated[mode]}
                digitStyle={digitStyle}
                downPayment={parseLocalizedNumber(downPayment) || 0}
                interestRate={parseLocalizedNumber(interestRate) || 0}
                loanTermYears={parseLocalizedNumber(loanTermYears) || 0}
                annualIncome={parseLocalizedNumber(annualIncome) || 0}
                targetHomePrice={parseLocalizedNumber(targetHomePrice) || 0}
                homePriceResult={homePriceResult}
                requiredIncomeResult={requiredIncomeResult}
              />
              <HouseAffordabilityModeTabs mode={mode} onModeChange={handleModeChange} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="house-affordability-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} visible={navBarVisible} />}
        />
      </div>

      {education}
    </>
  );
}
