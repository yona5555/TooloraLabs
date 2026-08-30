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
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import AffordableLoanModeTabs from "./AffordableLoanModeTabs";
import AffordableLoanInputPanel from "./AffordableLoanInputPanel";
import AffordableLoanResult from "./AffordableLoanResult";
import type { AffordableLoanMode } from "./types";

/** Consumer loans rarely run longer than this; also bounds calculateLoan's month-by-month loop against a freeze from an unbounded term. */
const MAX_LOAN_TERM_YEARS = 50;

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

export default function AffordableLoanCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.affordable-loan-calculator.nav");

  const [mode, setMode] = useState<AffordableLoanMode>("maxLoan");

  const [monthlyPayment, setMonthlyPayment] = useState(DEFAULTS.monthlyPayment);
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  const [maxLoanResult, setMaxLoanResult] = useState<MaxLoanResult>(() => computeMaxLoanResult(DEFAULTS));
  const [requiredPaymentResult, setRequiredPaymentResult] = useState<RequiredPaymentResult>(EMPTY_REQUIRED_PAYMENT);
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

  function handleClear() {
    setMonthlyPayment(DEFAULTS.monthlyPayment);
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
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
            <AffordableLoanInputPanel
              mode={mode}
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
                hasCalculated={hasCalculated[mode]}
                digitStyle={digitStyle}
                interestRate={parseLocalizedNumber(interestRate) || 0}
                loanTermYears={parseLocalizedNumber(loanTermYears) || 0}
                loanAmount={parseLocalizedNumber(loanAmount) || 0}
                maxLoanResult={maxLoanResult}
                requiredPaymentResult={requiredPaymentResult}
              />
              <AffordableLoanModeTabs mode={mode} onModeChange={handleModeChange} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="affordable-loan-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} visible={navBarVisible} />}
        />
      </div>

      {education}
    </>
  );
}
