"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateHouseAffordability,
  calculateRequiredIncome,
  calculateCarAffordability,
  calculatePersonalLoanAffordability,
  calculateBusinessLoanAffordability,
  type HouseAffordabilityResult as HomePriceResult,
  type RequiredIncomeResult,
  type CarAffordabilityResult,
  type PersonalLoanAffordabilityResult,
  type BusinessLoanAffordabilityResult,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import HouseAffordabilityModeTabs from "./HouseAffordabilityModeTabs";
import HouseAffordabilityInputPanel from "./HouseAffordabilityInputPanel";
import HouseAffordabilityResult from "./HouseAffordabilityResult";
import AffordabilityGuidelinesCard from "./AffordabilityGuidelinesCard";
import BorrowingComparisonChart from "./BorrowingComparisonChart";
import type { HouseAffordabilityMode, ComparisonRow } from "./types";

/** Consumer mortgages rarely run longer than this; also bounds worst-case computation cost. */
const MAX_LOAN_TERM_YEARS = 50;
const MAX_CAR_TERM_YEARS = 15;
const MAX_PERSONAL_TERM_YEARS = 10;
const MAX_BUSINESS_TERM_YEARS = 25;

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

  carAnnualIncome: "72000",
  carMonthlyDebts: "200",
  carDownPayment: "3000",
  carInterestRate: "6",
  carLoanTermYears: "5",

  personalAnnualIncome: "60000",
  personalMonthlyDebts: "500",
  personalInterestRate: "12",
  personalLoanTermYears: "3",

  businessMonthlyRevenue: "20000",
  businessExistingDebt: "3000",
  businessInterestRate: "9",
  businessLoanTermYears: "7",
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
  currency: "currency",
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

function computeCarResult(inputs: Inputs): CarAffordabilityResult {
  return calculateCarAffordability(
    parseLocalizedNumber(inputs.carAnnualIncome) || 0,
    parseLocalizedNumber(inputs.carMonthlyDebts) || 0,
    parseLocalizedNumber(inputs.carDownPayment) || 0,
    parseLocalizedNumber(inputs.carInterestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.carLoanTermYears) || 0, 0), MAX_CAR_TERM_YEARS)
  );
}

function computePersonalResult(inputs: Inputs): PersonalLoanAffordabilityResult {
  return calculatePersonalLoanAffordability(
    parseLocalizedNumber(inputs.personalAnnualIncome) || 0,
    parseLocalizedNumber(inputs.personalMonthlyDebts) || 0,
    parseLocalizedNumber(inputs.personalInterestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.personalLoanTermYears) || 0, 0), MAX_PERSONAL_TERM_YEARS)
  );
}

function computeBusinessResult(inputs: Inputs): BusinessLoanAffordabilityResult {
  return calculateBusinessLoanAffordability(
    parseLocalizedNumber(inputs.businessMonthlyRevenue) || 0,
    parseLocalizedNumber(inputs.businessExistingDebt) || 0,
    parseLocalizedNumber(inputs.businessInterestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.businessLoanTermYears) || 0, 0), MAX_BUSINESS_TERM_YEARS)
  );
}

/**
 * The cross-purpose comparison chart needs all four "max amount" purposes together, computed
 * from whichever fields each purpose's own tab currently holds — not just the one being actively
 * edited — so it's rebuilt in full on every Calculate, regardless of target mode.
 */
function computeComparisonRows(inputs: Inputs): ComparisonRow[] {
  return [
    { purpose: "home", maxAmount: computeHomePriceResult(inputs).maxHomePrice },
    { purpose: "car", maxAmount: computeCarResult(inputs).maxCarPrice },
    { purpose: "business", maxAmount: computeBusinessResult(inputs).maxLoanAmount },
    { purpose: "personal", maxAmount: computePersonalResult(inputs).maxLoanAmount },
  ];
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

  const [carAnnualIncome, setCarAnnualIncome] = useState(DEFAULTS.carAnnualIncome);
  const [carMonthlyDebts, setCarMonthlyDebts] = useState(DEFAULTS.carMonthlyDebts);
  const [carDownPayment, setCarDownPayment] = useState(DEFAULTS.carDownPayment);
  const [carInterestRate, setCarInterestRate] = useState(DEFAULTS.carInterestRate);
  const [carLoanTermYears, setCarLoanTermYears] = useState(DEFAULTS.carLoanTermYears);

  const [personalAnnualIncome, setPersonalAnnualIncome] = useState(DEFAULTS.personalAnnualIncome);
  const [personalMonthlyDebts, setPersonalMonthlyDebts] = useState(DEFAULTS.personalMonthlyDebts);
  const [personalInterestRate, setPersonalInterestRate] = useState(DEFAULTS.personalInterestRate);
  const [personalLoanTermYears, setPersonalLoanTermYears] = useState(DEFAULTS.personalLoanTermYears);

  const [businessMonthlyRevenue, setBusinessMonthlyRevenue] = useState(DEFAULTS.businessMonthlyRevenue);
  const [businessExistingDebt, setBusinessExistingDebt] = useState(DEFAULTS.businessExistingDebt);
  const [businessInterestRate, setBusinessInterestRate] = useState(DEFAULTS.businessInterestRate);
  const [businessLoanTermYears, setBusinessLoanTermYears] = useState(DEFAULTS.businessLoanTermYears);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [homePriceResult, setHomePriceResult] = useState<HomePriceResult>(() => computeHomePriceResult(DEFAULTS));
  const [requiredIncomeResult, setRequiredIncomeResult] = useState<RequiredIncomeResult>(EMPTY_REQUIRED_INCOME);
  const [carResult, setCarResult] = useState<CarAffordabilityResult>({ maxCarPrice: 0, loanAmount: 0, monthlyPayment: 0 });
  const [personalResult, setPersonalResult] = useState<PersonalLoanAffordabilityResult>({ maxLoanAmount: 0, monthlyPayment: 0 });
  const [businessResult, setBusinessResult] = useState<BusinessLoanAffordabilityResult>({ maxLoanAmount: 0, monthlyPayment: 0 });
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>(() => computeComparisonRows(DEFAULTS));

  const [hasCalculated, setHasCalculated] = useState<Record<HouseAffordabilityMode, boolean>>({
    homePrice: true,
    requiredIncome: false,
    car: false,
    business: false,
    personal: false,
  });
  const [initializedModes, setInitializedModes] = useState<Record<HouseAffordabilityMode, boolean>>({
    homePrice: true,
    requiredIncome: false,
    car: false,
    business: false,
    personal: false,
  });

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

  function buildInputs(): Inputs {
    return {
      annualIncome,
      targetHomePrice,
      monthlyDebts,
      downPayment,
      interestRate,
      loanTermYears,
      propertyTaxRate,
      annualHomeInsurance,
      monthlyHOA,
      carAnnualIncome,
      carMonthlyDebts,
      carDownPayment,
      carInterestRate,
      carLoanTermYears,
      personalAnnualIncome,
      personalMonthlyDebts,
      personalInterestRate,
      personalLoanTermYears,
      businessMonthlyRevenue,
      businessExistingDebt,
      businessInterestRate,
      businessLoanTermYears,
    };
  }

  function performCalculate(targetMode: HouseAffordabilityMode, options: { updateUrl: boolean }) {
    const inputs = buildInputs();

    if (targetMode === "homePrice") {
      setHomePriceResult(computeHomePriceResult(inputs));
    } else if (targetMode === "requiredIncome") {
      setRequiredIncomeResult(computeRequiredIncomeResult(inputs));
    } else if (targetMode === "car") {
      setCarResult(computeCarResult(inputs));
    } else if (targetMode === "personal") {
      setPersonalResult(computePersonalResult(inputs));
    } else {
      setBusinessResult(computeBusinessResult(inputs));
    }
    // The comparison chart spans all four "max amount" purposes at once, so it's kept in sync on
    // every Calculate regardless of which single tab triggered it.
    setComparisonRows(computeComparisonRows(inputs));

    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(
      resolveDigitStyle(
        annualIncome,
        targetHomePrice,
        monthlyDebts,
        downPayment,
        interestRate,
        loanTermYears,
        carAnnualIncome,
        personalAnnualIncome,
        businessMonthlyRevenue
      )
    );

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
      params.set(QUERY_PARAM_KEYS.currency, currency);
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

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately (converting every money-denominated field, across every purpose, in
  // place and recomputing every tab visited so far plus the comparison chart) rather than waiting
  // for an explicit Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);

    const convertedAnnualIncome = convert(annualIncome);
    const convertedTargetHomePrice = convert(targetHomePrice);
    const convertedMonthlyDebts = convert(monthlyDebts);
    const convertedDownPayment = convert(downPayment);
    const convertedAnnualHomeInsurance = convert(annualHomeInsurance);
    const convertedMonthlyHOA = convert(monthlyHOA);
    const convertedCarAnnualIncome = convert(carAnnualIncome);
    const convertedCarMonthlyDebts = convert(carMonthlyDebts);
    const convertedCarDownPayment = convert(carDownPayment);
    const convertedPersonalAnnualIncome = convert(personalAnnualIncome);
    const convertedPersonalMonthlyDebts = convert(personalMonthlyDebts);
    const convertedBusinessMonthlyRevenue = convert(businessMonthlyRevenue);
    const convertedBusinessExistingDebt = convert(businessExistingDebt);

    setAnnualIncome(convertedAnnualIncome);
    setTargetHomePrice(convertedTargetHomePrice);
    setMonthlyDebts(convertedMonthlyDebts);
    setDownPayment(convertedDownPayment);
    setAnnualHomeInsurance(convertedAnnualHomeInsurance);
    setMonthlyHOA(convertedMonthlyHOA);
    setCarAnnualIncome(convertedCarAnnualIncome);
    setCarMonthlyDebts(convertedCarMonthlyDebts);
    setCarDownPayment(convertedCarDownPayment);
    setPersonalAnnualIncome(convertedPersonalAnnualIncome);
    setPersonalMonthlyDebts(convertedPersonalMonthlyDebts);
    setBusinessMonthlyRevenue(convertedBusinessMonthlyRevenue);
    setBusinessExistingDebt(convertedBusinessExistingDebt);
    setCurrency(next);

    const convertedInputs: Inputs = {
      annualIncome: convertedAnnualIncome,
      targetHomePrice: convertedTargetHomePrice,
      monthlyDebts: convertedMonthlyDebts,
      downPayment: convertedDownPayment,
      interestRate,
      loanTermYears,
      propertyTaxRate,
      annualHomeInsurance: convertedAnnualHomeInsurance,
      monthlyHOA: convertedMonthlyHOA,
      carAnnualIncome: convertedCarAnnualIncome,
      carMonthlyDebts: convertedCarMonthlyDebts,
      carDownPayment: convertedCarDownPayment,
      carInterestRate,
      carLoanTermYears,
      personalAnnualIncome: convertedPersonalAnnualIncome,
      personalMonthlyDebts: convertedPersonalMonthlyDebts,
      personalInterestRate,
      personalLoanTermYears,
      businessMonthlyRevenue: convertedBusinessMonthlyRevenue,
      businessExistingDebt: convertedBusinessExistingDebt,
      businessInterestRate,
      businessLoanTermYears,
    };

    if (initializedModes.homePrice) setHomePriceResult(computeHomePriceResult(convertedInputs));
    if (initializedModes.requiredIncome) setRequiredIncomeResult(computeRequiredIncomeResult(convertedInputs));
    if (initializedModes.car) setCarResult(computeCarResult(convertedInputs));
    if (initializedModes.personal) setPersonalResult(computePersonalResult(convertedInputs));
    if (initializedModes.business) setBusinessResult(computeBusinessResult(convertedInputs));
    setComparisonRows(computeComparisonRows(convertedInputs));

    const params = new URLSearchParams();
    params.set(QUERY_PARAM_KEYS.mode, mode);
    params.set(QUERY_PARAM_KEYS.income, convertedAnnualIncome);
    params.set(QUERY_PARAM_KEYS.targetPrice, convertedTargetHomePrice);
    params.set(QUERY_PARAM_KEYS.debts, convertedMonthlyDebts);
    params.set(QUERY_PARAM_KEYS.down, convertedDownPayment);
    params.set(QUERY_PARAM_KEYS.rate, interestRate);
    params.set(QUERY_PARAM_KEYS.term, loanTermYears);
    params.set(QUERY_PARAM_KEYS.tax, propertyTaxRate);
    params.set(QUERY_PARAM_KEYS.insurance, convertedAnnualHomeInsurance);
    params.set(QUERY_PARAM_KEYS.hoa, convertedMonthlyHOA);
    params.set(QUERY_PARAM_KEYS.currency, next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
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
    setCarAnnualIncome(DEFAULTS.carAnnualIncome);
    setCarMonthlyDebts(DEFAULTS.carMonthlyDebts);
    setCarDownPayment(DEFAULTS.carDownPayment);
    setCarInterestRate(DEFAULTS.carInterestRate);
    setCarLoanTermYears(DEFAULTS.carLoanTermYears);
    setPersonalAnnualIncome(DEFAULTS.personalAnnualIncome);
    setPersonalMonthlyDebts(DEFAULTS.personalMonthlyDebts);
    setPersonalInterestRate(DEFAULTS.personalInterestRate);
    setPersonalLoanTermYears(DEFAULTS.personalLoanTermYears);
    setBusinessMonthlyRevenue(DEFAULTS.businessMonthlyRevenue);
    setBusinessExistingDebt(DEFAULTS.businessExistingDebt);
    setBusinessInterestRate(DEFAULTS.businessInterestRate);
    setBusinessLoanTermYears(DEFAULTS.businessLoanTermYears);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setComparisonRows(computeComparisonRows(DEFAULTS));
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "borrowing-comparison", label: tNav("borrowingComparison") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const activeInterestRate =
    mode === "car" ? carInterestRate : mode === "personal" ? personalInterestRate : mode === "business" ? businessInterestRate : interestRate;
  const activeLoanTermYears =
    mode === "car" ? carLoanTermYears : mode === "personal" ? personalLoanTermYears : mode === "business" ? businessLoanTermYears : loanTermYears;

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <HouseAffordabilityInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
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
              carAnnualIncome={carAnnualIncome}
              onCarAnnualIncomeChange={setCarAnnualIncome}
              carMonthlyDebts={carMonthlyDebts}
              onCarMonthlyDebtsChange={setCarMonthlyDebts}
              carDownPayment={carDownPayment}
              onCarDownPaymentChange={setCarDownPayment}
              carInterestRate={carInterestRate}
              onCarInterestRateChange={setCarInterestRate}
              carLoanTermYears={carLoanTermYears}
              onCarLoanTermYearsChange={setCarLoanTermYears}
              personalAnnualIncome={personalAnnualIncome}
              onPersonalAnnualIncomeChange={setPersonalAnnualIncome}
              personalMonthlyDebts={personalMonthlyDebts}
              onPersonalMonthlyDebtsChange={setPersonalMonthlyDebts}
              personalInterestRate={personalInterestRate}
              onPersonalInterestRateChange={setPersonalInterestRate}
              personalLoanTermYears={personalLoanTermYears}
              onPersonalLoanTermYearsChange={setPersonalLoanTermYears}
              businessMonthlyRevenue={businessMonthlyRevenue}
              onBusinessMonthlyRevenueChange={setBusinessMonthlyRevenue}
              businessExistingDebt={businessExistingDebt}
              onBusinessExistingDebtChange={setBusinessExistingDebt}
              businessInterestRate={businessInterestRate}
              onBusinessInterestRateChange={setBusinessInterestRate}
              businessLoanTermYears={businessLoanTermYears}
              onBusinessLoanTermYearsChange={setBusinessLoanTermYears}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <HouseAffordabilityResult
                mode={mode}
                currency={currency}
                hasCalculated={hasCalculated[mode]}
                digitStyle={digitStyle}
                downPayment={parseLocalizedNumber(downPayment) || 0}
                interestRate={parseLocalizedNumber(activeInterestRate) || 0}
                loanTermYears={parseLocalizedNumber(activeLoanTermYears) || 0}
                annualIncome={parseLocalizedNumber(annualIncome) || 0}
                targetHomePrice={parseLocalizedNumber(targetHomePrice) || 0}
                monthlyDebts={parseLocalizedNumber(monthlyDebts) || 0}
                homePriceResult={homePriceResult}
                requiredIncomeResult={requiredIncomeResult}
                carAnnualIncome={parseLocalizedNumber(carAnnualIncome) || 0}
                carDownPayment={parseLocalizedNumber(carDownPayment) || 0}
                carMonthlyDebts={parseLocalizedNumber(carMonthlyDebts) || 0}
                carResult={carResult}
                personalAnnualIncome={parseLocalizedNumber(personalAnnualIncome) || 0}
                personalMonthlyDebts={parseLocalizedNumber(personalMonthlyDebts) || 0}
                personalResult={personalResult}
                businessMonthlyRevenue={parseLocalizedNumber(businessMonthlyRevenue) || 0}
                businessExistingDebt={parseLocalizedNumber(businessExistingDebt) || 0}
                businessResult={businessResult}
              />
              <HouseAffordabilityModeTabs mode={mode} onModeChange={handleModeChange} />
              <AffordabilityGuidelinesCard mode={mode} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="house-affordability-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <BorrowingComparisonChart rows={comparisonRows} digitStyle={digitStyle} currency={currency} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
