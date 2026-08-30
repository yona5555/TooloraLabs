"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MortgageCalculator as MortgageCalculatorTool, calculateHouseAffordability, type HouseAffordabilityResult } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import MortgageInputPanel from "./MortgageInputPanel";
import MortgageResult from "./MortgageResult";
import MortgagePayoffTimeResult from "./MortgagePayoffTimeResult";
import MortgageHomePriceInputPanel from "./MortgageHomePriceInputPanel";
import MortgageHomePriceResult from "./MortgageHomePriceResult";
import MortgageQuickInsight from "./MortgageQuickInsight";
import MortgageModeTabs from "./MortgageModeTabs";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import MortgagePayoffChart from "./MortgagePayoffChart";
import MortgageAmortizationTable from "./MortgageAmortizationTable";
import MortgageScenarioComparison from "./MortgageScenarioComparison";
import MortgageBiweeklyPayment from "./MortgageBiweeklyPayment";
import SectionNav from "@/components/tool-ui/SectionNav";
import type { DownPaymentMode, MortgageExtendedResult, MortgageMode } from "./types";

const tool = new MortgageCalculatorTool();

const MAX_HOME_PRICE = 50_000_000;
const MAX_INTEREST_RATE = 25;
const MIN_LOAN_TERM_YEARS = 1;
const MAX_LOAN_TERM_YEARS = 50;

const DEFAULT_HOME_PRICE = 400_000;
const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE = 6.5;
const DEFAULT_LOAN_TERM_YEARS = 30;
const DEFAULT_PROPERTY_TAX = 4_800;
const DEFAULT_INSURANCE = 1_500;

// Home Price mode defaults — an independent set of fields (income-driven, not price-driven),
// matching House Affordability Calculator's own "homePrice" mode inputs.
const HP_DEFAULTS = {
  annualIncome: "90000",
  monthlyDebts: "400",
  downPayment: "40000",
  interestRate: "6.5",
  loanTermYears: "30",
  propertyTaxRate: "1.2",
  annualInsurance: "1500",
  monthlyHoa: "0",
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildResult(
  homePrice: number,
  downPayment: number,
  annualInterestRate: number,
  loanTermYears: number,
  annualPropertyTax: number,
  annualHomeInsurance: number,
  monthlyHOA: number,
  monthlyPMI: number,
  extraMonthlyPayment: number
): MortgageExtendedResult {
  const output = tool.execute(
    {
      homePrice,
      downPayment,
      annualInterestRate,
      loanTermYears,
      annualPropertyTax,
      annualHomeInsurance,
      monthlyHOA,
      monthlyPMI,
      extraMonthlyPayment,
    },
    { locale: "en-US" }
  );
  return output.data;
}

type HpInputs = typeof HP_DEFAULTS;

function computeHomePriceResult(inputs: HpInputs): HouseAffordabilityResult {
  return calculateHouseAffordability(
    parseLocalizedNumber(inputs.annualIncome) || 0,
    parseLocalizedNumber(inputs.monthlyDebts) || 0,
    parseLocalizedNumber(inputs.downPayment) || 0,
    parseLocalizedNumber(inputs.interestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.loanTermYears) || 0, 0), MAX_LOAN_TERM_YEARS),
    parseLocalizedNumber(inputs.propertyTaxRate) || 0,
    parseLocalizedNumber(inputs.annualInsurance) || 0,
    parseLocalizedNumber(inputs.monthlyHoa) || 0
  );
}

const DEFAULT_DOWN_PAYMENT_AMOUNT = Math.round(DEFAULT_HOME_PRICE * (DEFAULT_DOWN_PAYMENT_PERCENT / 100));

export default function MortgageCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.mortgage-calculator");

  const [mode, setMode] = useState<MortgageMode>("standard");

  // Standard / Payoff Time — untouched from the original tool: both tabs are views of the exact
  // same inputs and the exact same `MortgageResult`, so they share one set of state and one
  // calculation, unchanged from before the tab layer was added.
  const [homePrice, setHomePrice] = useState(String(DEFAULT_HOME_PRICE));
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>("percent");
  const [downPaymentAmount, setDownPaymentAmount] = useState(String(DEFAULT_DOWN_PAYMENT_AMOUNT));
  const [downPaymentPercent, setDownPaymentPercent] = useState(String(DEFAULT_DOWN_PAYMENT_PERCENT));
  const [interestRate, setInterestRate] = useState(String(DEFAULT_INTEREST_RATE));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULT_LOAN_TERM_YEARS));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULT_PROPERTY_TAX));
  const [insurance, setInsurance] = useState(String(DEFAULT_INSURANCE));
  const [hoa, setHoa] = useState("0");
  const [pmi, setPmi] = useState("0");
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState("0");

  const [error, setError] = useState("");
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<MortgageExtendedResult>(() =>
    buildResult(
      DEFAULT_HOME_PRICE,
      DEFAULT_DOWN_PAYMENT_AMOUNT,
      DEFAULT_INTEREST_RATE,
      DEFAULT_LOAN_TERM_YEARS,
      DEFAULT_PROPERTY_TAX,
      DEFAULT_INSURANCE,
      0,
      0,
      0
    )
  );

  // Home Price mode — a genuinely separate calculation (income-driven, via calculateHouseAffordability),
  // so it gets its own fields, its own result, and the Calculate/Clear-with-empty-state pattern used
  // by every other new reverse-solve tab this session.
  const [hpAnnualIncome, setHpAnnualIncome] = useState(HP_DEFAULTS.annualIncome);
  const [hpMonthlyDebts, setHpMonthlyDebts] = useState(HP_DEFAULTS.monthlyDebts);
  const [hpDownPayment, setHpDownPayment] = useState(HP_DEFAULTS.downPayment);
  const [hpInterestRate, setHpInterestRate] = useState(HP_DEFAULTS.interestRate);
  const [hpLoanTermYears, setHpLoanTermYears] = useState(HP_DEFAULTS.loanTermYears);
  const [hpPropertyTaxRate, setHpPropertyTaxRate] = useState(HP_DEFAULTS.propertyTaxRate);
  const [hpAnnualInsurance, setHpAnnualInsurance] = useState(HP_DEFAULTS.annualInsurance);
  const [hpMonthlyHoa, setHpMonthlyHoa] = useState(HP_DEFAULTS.monthlyHoa);
  const [hpDigitStyle, setHpDigitStyle] = useState<DigitStyle>("western");
  const [hpResult, setHpResult] = useState<HouseAffordabilityResult>(() => computeHomePriceResult(HP_DEFAULTS));
  const [hpHasCalculated, setHpHasCalculated] = useState(true);

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

  function handleDownPaymentModeChange(next: DownPaymentMode) {
    if (next === downPaymentMode) return;

    const homePriceValue = parseLocalizedNumber(homePrice);

    if (next === "amount") {
      const percentValue = parseLocalizedNumber(downPaymentPercent);
      if (!Number.isNaN(homePriceValue) && !Number.isNaN(percentValue)) {
        setDownPaymentAmount(String(Math.round(homePriceValue * (percentValue / 100))));
      }
    } else {
      const amountValue = parseLocalizedNumber(downPaymentAmount);
      if (!Number.isNaN(homePriceValue) && homePriceValue > 0 && !Number.isNaN(amountValue)) {
        setDownPaymentPercent(String(round1((amountValue / homePriceValue) * 100)));
      }
    }

    setDownPaymentMode(next);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const homePriceValue = parseLocalizedNumber(homePrice);
    if (!homePrice || Number.isNaN(homePriceValue)) {
      setError(t("errors.required"));
      return;
    }
    if (homePriceValue <= 0 || homePriceValue > MAX_HOME_PRICE) {
      setError(t("errors.homePriceRange"));
      return;
    }

    const downPaymentValue =
      downPaymentMode === "percent"
        ? homePriceValue * (parseLocalizedNumber(downPaymentPercent) / 100)
        : parseLocalizedNumber(downPaymentAmount);
    if (Number.isNaN(downPaymentValue)) {
      setError(t("errors.required"));
      return;
    }
    if (downPaymentValue < 0 || downPaymentValue >= homePriceValue) {
      setError(t("errors.downPaymentRange"));
      return;
    }

    const interestRateValue = parseLocalizedNumber(interestRate);
    if (Number.isNaN(interestRateValue) || interestRateValue < 0 || interestRateValue > MAX_INTEREST_RATE) {
      setError(t("errors.interestRateRange"));
      return;
    }

    const loanTermValue = parseLocalizedNumber(loanTermYears);
    if (Number.isNaN(loanTermValue) || loanTermValue < MIN_LOAN_TERM_YEARS || loanTermValue > MAX_LOAN_TERM_YEARS) {
      setError(t("errors.loanTermRange"));
      return;
    }

    const propertyTaxValue = parseLocalizedNumber(propertyTax);
    const insuranceValue = parseLocalizedNumber(insurance);
    const hoaValue = parseLocalizedNumber(hoa);
    const pmiValue = parseLocalizedNumber(pmi);
    const extraValue = parseLocalizedNumber(extraMonthlyPayment);
    if (
      [propertyTaxValue, insuranceValue, hoaValue, pmiValue, extraValue].some(
        (value) => Number.isNaN(value) || value < 0
      )
    ) {
      setError(t("errors.negativeValue"));
      return;
    }

    setResult(
      buildResult(
        homePriceValue,
        downPaymentValue,
        interestRateValue,
        loanTermValue,
        propertyTaxValue,
        insuranceValue,
        hoaValue,
        pmiValue,
        extraValue
      )
    );
    setDigitStyle(
      resolveDigitStyle(
        homePrice,
        downPaymentMode === "percent" ? downPaymentPercent : downPaymentAmount,
        interestRate,
        loanTermYears,
        propertyTax,
        insurance,
        hoa,
        pmi,
        extraMonthlyPayment
      )
    );
  }

  function handleReset() {
    setHomePrice(String(DEFAULT_HOME_PRICE));
    setDownPaymentMode("percent");
    setDownPaymentAmount(String(DEFAULT_DOWN_PAYMENT_AMOUNT));
    setDownPaymentPercent(String(DEFAULT_DOWN_PAYMENT_PERCENT));
    setInterestRate(String(DEFAULT_INTEREST_RATE));
    setLoanTermYears(String(DEFAULT_LOAN_TERM_YEARS));
    setPropertyTax(String(DEFAULT_PROPERTY_TAX));
    setInsurance(String(DEFAULT_INSURANCE));
    setHoa("0");
    setPmi("0");
    setExtraMonthlyPayment("0");
    setError("");
    setDigitStyle("western");
    setResult(
      buildResult(
        DEFAULT_HOME_PRICE,
        DEFAULT_DOWN_PAYMENT_AMOUNT,
        DEFAULT_INTEREST_RATE,
        DEFAULT_LOAN_TERM_YEARS,
        DEFAULT_PROPERTY_TAX,
        DEFAULT_INSURANCE,
        0,
        0,
        0
      )
    );
  }

  function handleHomePriceCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const inputs: HpInputs = {
      annualIncome: hpAnnualIncome,
      monthlyDebts: hpMonthlyDebts,
      downPayment: hpDownPayment,
      interestRate: hpInterestRate,
      loanTermYears: hpLoanTermYears,
      propertyTaxRate: hpPropertyTaxRate,
      annualInsurance: hpAnnualInsurance,
      monthlyHoa: hpMonthlyHoa,
    };
    setHpResult(computeHomePriceResult(inputs));
    setHpHasCalculated(true);
    setHpDigitStyle(resolveDigitStyle(hpAnnualIncome, hpMonthlyDebts, hpDownPayment, hpInterestRate, hpLoanTermYears, hpPropertyTaxRate, hpAnnualInsurance, hpMonthlyHoa));
  }

  function handleHomePriceClear() {
    setHpAnnualIncome(HP_DEFAULTS.annualIncome);
    setHpMonthlyDebts(HP_DEFAULTS.monthlyDebts);
    setHpDownPayment(HP_DEFAULTS.downPayment);
    setHpInterestRate(HP_DEFAULTS.interestRate);
    setHpLoanTermYears(HP_DEFAULTS.loanTermYears);
    setHpPropertyTaxRate(HP_DEFAULTS.propertyTaxRate);
    setHpAnnualInsurance(HP_DEFAULTS.annualInsurance);
    setHpMonthlyHoa(HP_DEFAULTS.monthlyHoa);
    setHpDigitStyle("western");
    setHpHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: t("nav.tool") },
    { id: "amortization", label: t("nav.amortization") },
    { id: "scenario-comparison", label: t("nav.scenarioComparison") },
    { id: "faq", label: t("nav.faq") },
    { id: "behind-the-tool", label: t("nav.behindTheTool") },
  ];

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            mode === "homePrice" ? (
              <MortgageHomePriceInputPanel
                annualIncome={hpAnnualIncome}
                onAnnualIncomeChange={setHpAnnualIncome}
                monthlyDebts={hpMonthlyDebts}
                onMonthlyDebtsChange={setHpMonthlyDebts}
                downPayment={hpDownPayment}
                onDownPaymentChange={setHpDownPayment}
                interestRate={hpInterestRate}
                onInterestRateChange={setHpInterestRate}
                loanTermYears={hpLoanTermYears}
                onLoanTermYearsChange={setHpLoanTermYears}
                propertyTaxRate={hpPropertyTaxRate}
                onPropertyTaxRateChange={setHpPropertyTaxRate}
                annualInsurance={hpAnnualInsurance}
                onAnnualInsuranceChange={setHpAnnualInsurance}
                monthlyHoa={hpMonthlyHoa}
                onMonthlyHoaChange={setHpMonthlyHoa}
                onCalculate={handleHomePriceCalculate}
                onClear={handleHomePriceClear}
              />
            ) : (
              <MortgageInputPanel
                homePrice={homePrice}
                onHomePriceChange={setHomePrice}
                downPaymentMode={downPaymentMode}
                onDownPaymentModeChange={handleDownPaymentModeChange}
                downPaymentAmount={downPaymentAmount}
                onDownPaymentAmountChange={setDownPaymentAmount}
                downPaymentPercent={downPaymentPercent}
                onDownPaymentPercentChange={setDownPaymentPercent}
                interestRate={interestRate}
                onInterestRateChange={setInterestRate}
                loanTermYears={loanTermYears}
                onLoanTermYearsChange={setLoanTermYears}
                propertyTax={propertyTax}
                onPropertyTaxChange={setPropertyTax}
                insurance={insurance}
                onInsuranceChange={setInsurance}
                hoa={hoa}
                onHoaChange={setHoa}
                pmi={pmi}
                onPmiChange={setPmi}
                extraMonthlyPayment={extraMonthlyPayment}
                onExtraMonthlyPaymentChange={setExtraMonthlyPayment}
                error={error}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            )
          }
          result={
            <div className="flex flex-col gap-3">
              {mode === "standard" && (
                <div className="flex flex-col gap-4">
                  <MortgageResult result={result} digitStyle={digitStyle} />
                  <MortgageQuickInsight result={result} digitStyle={digitStyle} />
                </div>
              )}
              {mode === "payoffTime" && <MortgagePayoffTimeResult result={result} digitStyle={digitStyle} />}
              {mode === "homePrice" && (
                <MortgageHomePriceResult
                  hasCalculated={hpHasCalculated}
                  digitStyle={hpDigitStyle}
                  annualIncome={parseLocalizedNumber(hpAnnualIncome) || 0}
                  monthlyDebts={parseLocalizedNumber(hpMonthlyDebts) || 0}
                  downPayment={parseLocalizedNumber(hpDownPayment) || 0}
                  interestRate={parseLocalizedNumber(hpInterestRate) || 0}
                  loanTermYears={parseLocalizedNumber(hpLoanTermYears) || 0}
                  propertyTaxRate={parseLocalizedNumber(hpPropertyTaxRate) || 0}
                  annualInsurance={parseLocalizedNumber(hpAnnualInsurance) || 0}
                  monthlyHoa={parseLocalizedNumber(hpMonthlyHoa) || 0}
                  result={hpResult}
                />
              )}
              <MortgageModeTabs mode={mode} onModeChange={setMode} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="mortgage-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} showJumpToBottom visible={navBarVisible} />
              <MortgagePayoffChart result={result} digitStyle={digitStyle} />
              <MortgageScenarioComparison result={result} digitStyle={digitStyle} />
              <MortgageAmortizationTable result={result} digitStyle={digitStyle} />
              <MortgageBiweeklyPayment result={result} digitStyle={digitStyle} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
