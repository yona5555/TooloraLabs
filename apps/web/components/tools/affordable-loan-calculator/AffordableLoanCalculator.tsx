"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateAffordableLoan,
  calculateLoan,
  type AffordableLoanResult as MaxLoanResult,
  type LoanResult as RequiredPaymentResult,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import AffordableLoanModeTabs from "./AffordableLoanModeTabs";
import AffordableLoanInputPanel from "./AffordableLoanInputPanel";
import AffordableLoanResult from "./AffordableLoanResult";
import AffordableLoanTermTable from "./AffordableLoanTermTable";
import AffordableLoanTermChart from "./AffordableLoanTermChart";
import BorrowingTipsCard from "./BorrowingTipsCard";
import type { AffordableLoanMode, TermComparisonRow } from "./types";

/** Consumer loans rarely run longer than this; also bounds calculateLoan's month-by-month loop against a freeze from an unbounded term. */
const MAX_LOAN_TERM_YEARS = 50;

/** Terms compared side by side in the term-sensitivity table/chart, independent of whichever term the user has entered above. */
const COMPARISON_TERMS = [3, 5, 7, 10];

const DEFAULTS = { monthlyPayment: "300", loanAmount: "10000", interestRate: "6", loanTermYears: "5" };

const EMPTY_REQUIRED_PAYMENT: RequiredPaymentResult = {
  loanAmount: 0,
  monthlyPayment: 0,
  totalPayment: 0,
  totalInterest: 0,
  amortizationSchedule: [],
  monthlySchedule: [],
};

const QUERY_PARAM_KEYS = {
  mode: "mode",
  payment: "payment",
  amount: "amount",
  rate: "rate",
  term: "term",
  currency: "currency",
} as const;

type Inputs = typeof DEFAULTS;

function computeMaxLoanResult(inputs: Inputs): MaxLoanResult {
  return calculateAffordableLoan(
    parseLocalizedNumber(inputs.monthlyPayment) || 0,
    parseLocalizedNumber(inputs.interestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.loanTermYears) || 0, 0), MAX_LOAN_TERM_YEARS)
  );
}

function computeRequiredPaymentResult(inputs: Inputs): RequiredPaymentResult {
  return calculateLoan(
    parseLocalizedNumber(inputs.loanAmount) || 0,
    parseLocalizedNumber(inputs.interestRate) || 0,
    Math.min(Math.max(parseLocalizedNumber(inputs.loanTermYears) || 0, 0), MAX_LOAN_TERM_YEARS)
  );
}

/**
 * Term-sensitivity comparison: for each of a fixed set of terms, reuses the same two engine
 * functions the two modes already call (calculateLoan, calculateAffordableLoan) rather than a
 * new calculation — showing both what the current loan amount would cost per month, and what
 * the current monthly payment could borrow, at that term.
 */
function computeTermComparison(inputs: Inputs): TermComparisonRow[] {
  const monthlyPayment = parseLocalizedNumber(inputs.monthlyPayment) || 0;
  const loanAmount = parseLocalizedNumber(inputs.loanAmount) || 0;
  const interestRate = parseLocalizedNumber(inputs.interestRate) || 0;

  return COMPARISON_TERMS.map((termYears) => ({
    termYears,
    monthlyPaymentForLoan: calculateLoan(loanAmount, interestRate, termYears).monthlyPayment,
    maxLoanForPayment: calculateAffordableLoan(monthlyPayment, interestRate, termYears).maxLoanAmount,
  }));
}

export default function AffordableLoanCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.affordable-loan-calculator.nav");

  const [mode, setMode] = useState<AffordableLoanMode>("maxLoan");

  const [monthlyPayment, setMonthlyPayment] = useState(DEFAULTS.monthlyPayment);
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [maxLoanResult, setMaxLoanResult] = useState<MaxLoanResult>(() => computeMaxLoanResult(DEFAULTS));
  const [requiredPaymentResult, setRequiredPaymentResult] = useState<RequiredPaymentResult>(EMPTY_REQUIRED_PAYMENT);
  const [termComparisonRows, setTermComparisonRows] = useState<TermComparisonRow[]>(() => computeTermComparison(DEFAULTS));
  const [hasCalculated, setHasCalculated] = useState<Record<AffordableLoanMode, boolean>>({ maxLoan: true, requiredPayment: false });
  const [initializedModes, setInitializedModes] = useState<Record<AffordableLoanMode, boolean>>({ maxLoan: true, requiredPayment: false });

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

  function performCalculate(targetMode: AffordableLoanMode, options: { updateUrl: boolean }) {
    const inputs: Inputs = { monthlyPayment, loanAmount, interestRate, loanTermYears };

    if (targetMode === "maxLoan") {
      setMaxLoanResult(computeMaxLoanResult(inputs));
    } else {
      setRequiredPaymentResult(computeRequiredPaymentResult(inputs));
    }
    // The term-sensitivity comparison depends on both loanAmount and monthlyPayment, not just
    // whichever field the active mode edits, so it's recalculated on every Calculate regardless
    // of target mode.
    setTermComparisonRows(computeTermComparison(inputs));

    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(resolveDigitStyle(monthlyPayment, loanAmount, interestRate, loanTermYears));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set(QUERY_PARAM_KEYS.mode, targetMode);
      params.set(QUERY_PARAM_KEYS.payment, monthlyPayment);
      params.set(QUERY_PARAM_KEYS.amount, loanAmount);
      params.set(QUERY_PARAM_KEYS.rate, interestRate);
      params.set(QUERY_PARAM_KEYS.term, loanTermYears);
      params.set(QUERY_PARAM_KEYS.currency, currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  function handleModeChange(newMode: AffordableLoanMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately (converting every money-denominated field in place and recomputing
  // every tab visited so far, plus the term comparison) rather than waiting for an explicit
  // Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);
    const convertedPayment = convert(monthlyPayment);
    const convertedAmount = convert(loanAmount);

    setMonthlyPayment(convertedPayment);
    setLoanAmount(convertedAmount);
    setCurrency(next);

    const convertedInputs: Inputs = { monthlyPayment: convertedPayment, loanAmount: convertedAmount, interestRate, loanTermYears };
    if (initializedModes.maxLoan) setMaxLoanResult(computeMaxLoanResult(convertedInputs));
    if (initializedModes.requiredPayment) setRequiredPaymentResult(computeRequiredPaymentResult(convertedInputs));
    setTermComparisonRows(computeTermComparison(convertedInputs));

    const params = new URLSearchParams();
    params.set(QUERY_PARAM_KEYS.mode, mode);
    params.set(QUERY_PARAM_KEYS.payment, convertedPayment);
    params.set(QUERY_PARAM_KEYS.amount, convertedAmount);
    params.set(QUERY_PARAM_KEYS.rate, interestRate);
    params.set(QUERY_PARAM_KEYS.term, loanTermYears);
    params.set(QUERY_PARAM_KEYS.currency, next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function handleClear() {
    setMonthlyPayment(DEFAULTS.monthlyPayment);
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setTermComparisonRows(computeTermComparison(DEFAULTS));
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "term-comparison", label: tNav("termComparison") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <AffordableLoanInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              monthlyPayment={monthlyPayment}
              onMonthlyPaymentChange={setMonthlyPayment}
              loanAmount={loanAmount}
              onLoanAmountChange={setLoanAmount}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              loanTermYears={loanTermYears}
              onLoanTermYearsChange={setLoanTermYears}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <AffordableLoanResult
                mode={mode}
                currency={currency}
                hasCalculated={hasCalculated[mode]}
                digitStyle={digitStyle}
                interestRate={parseLocalizedNumber(interestRate) || 0}
                loanTermYears={parseLocalizedNumber(loanTermYears) || 0}
                loanAmount={parseLocalizedNumber(loanAmount) || 0}
                maxLoanResult={maxLoanResult}
                requiredPaymentResult={requiredPaymentResult}
              />
              <AffordableLoanModeTabs mode={mode} onModeChange={handleModeChange} />
              <BorrowingTipsCard />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="affordable-loan-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <div id="term-comparison" className="scroll-mt-32">
                <AffordableLoanTermChart hasCalculated={true} rows={termComparisonRows} digitStyle={digitStyle} currency={currency} />
              </div>
              <AffordableLoanTermTable hasCalculated={true} rows={termComparisonRows} digitStyle={digitStyle} currency={currency} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
