"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateAmortizedLoan,
  calculateDeferredPaymentLoan,
  calculateBond,
  MAX_LOAN_TERM_YEARS,
  type AmortizedLoanResult,
  type DeferredPaymentLoanResult,
  type BondResult,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import LoanModeTabs from "./LoanModeTabs";
import LoanInputPanel from "./LoanInputPanel";
import LoanResult from "./LoanResult";
import LoanAmortizationChart from "./LoanAmortizationChart";
import LoanGrowthChart from "./LoanGrowthChart";
import LoanAmortizationTable from "./LoanAmortizationTable";
import LoanGrowthTable from "./LoanGrowthTable";
import LoanDisclaimer from "./LoanDisclaimer";
import { LoanLiveInputsProvider } from "./LoanLiveInputsContext";
import type { LoanMode, TermUnit, CompoundingFrequency, PaymentFrequency } from "./types";

const DEFAULTS = {
  loanAmount: "10000",
  dueAmount: "10000",
  interestRate: "8",
  termValue: "5",
};

const EMPTY_DEFERRED: DeferredPaymentLoanResult = { loanAmount: 0, amountDue: 0, totalInterest: 0, schedule: [] };
const EMPTY_BOND: BondResult = { amountReceived: 0, dueAmount: 0, totalInterest: 0, schedule: [] };

type ResolvedParams = {
  interestRate: number;
  termYears: number;
  compoundFrequency: CompoundingFrequency;
  paymentFrequency: PaymentFrequency;
};
const EMPTY_PARAMS: ResolvedParams = { interestRate: 0, termYears: 0, compoundFrequency: "monthly", paymentFrequency: "monthly" };

const QUERY_PARAM_KEYS = {
  mode: "mode",
  loanAmount: "amount",
  dueAmount: "due",
  interestRate: "rate",
  termValue: "term",
  termUnit: "termUnit",
  compound: "compound",
  payFrequency: "payFrequency",
  currency: "currency",
} as const;

function termToYears(termValue: string, termUnit: TermUnit): number {
  const raw = parseLocalizedNumber(termValue) || 0;
  return termUnit === "months" ? raw / 12 : raw;
}

// Matches calculator.net-style behavior: the Amortized tab (the default active tab) shows a
// real result computed from the default field values immediately, with no empty state and no
// flash — computed once as a lazy useState initializer rather than via an effect, so it's
// present in the very first render (including SSR) instead of a client-only follow-up render.
const DEFAULT_AMORTIZED_PARAMS: ResolvedParams = {
  interestRate: parseLocalizedNumber(DEFAULTS.interestRate) || 0,
  termYears: termToYears(DEFAULTS.termValue, "years"),
  compoundFrequency: "monthly",
  paymentFrequency: "monthly",
};

function getDefaultAmortizedResult(): AmortizedLoanResult {
  const loanAmountValue = parseLocalizedNumber(DEFAULTS.loanAmount) || 0;
  return calculateAmortizedLoan(
    loanAmountValue,
    DEFAULT_AMORTIZED_PARAMS.interestRate,
    DEFAULT_AMORTIZED_PARAMS.termYears,
    DEFAULT_AMORTIZED_PARAMS.compoundFrequency,
    DEFAULT_AMORTIZED_PARAMS.paymentFrequency
  );
}

export default function LoanCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.loan-calculator.nav");
  const t = useTranslations("tools.loan-calculator");

  const [mode, setMode] = useState<LoanMode>("amortized");

  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [dueAmount, setDueAmount] = useState(DEFAULTS.dueAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [termValue, setTermValue] = useState(DEFAULTS.termValue);
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundingFrequency>("monthly");
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>("monthly");

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // The Amortized tab starts pre-calculated (see getDefaultAmortizedResult above); Deferred and
  // Bond stay uncalculated until their tab is first visited or Calculate is pressed on them.
  const [hasCalculated, setHasCalculated] = useState<Record<LoanMode, boolean>>({ amortized: true, deferred: false, bond: false });
  // Tracks which tabs have ever shown a result — unlike hasCalculated, Clear does NOT reset this,
  // so returning to a tab you just cleared stays empty instead of auto-recalculating again.
  const [initializedModes, setInitializedModes] = useState<Record<LoanMode, boolean>>({ amortized: true, deferred: false, bond: false });
  const [amortizedResult, setAmortizedResult] = useState<AmortizedLoanResult>(getDefaultAmortizedResult);
  const [deferredResult, setDeferredResult] = useState(EMPTY_DEFERRED);
  const [bondResult, setBondResult] = useState(EMPTY_BOND);
  const [amortizedParams, setAmortizedParams] = useState<ResolvedParams>(DEFAULT_AMORTIZED_PARAMS);
  const [deferredParams, setDeferredParams] = useState(EMPTY_PARAMS);
  const [bondParams, setBondParams] = useState(EMPTY_PARAMS);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  // Same dual-observer hysteresis technique validated on Compound Interest Calculator: two
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

  // Shared by the explicit Calculate button and the first-visit auto-calculation, so both
  // paths use identical math and both mark the tab as initialized — only the explicit path
  // touches the URL, keeping it clean until the user actually presses Calculate.
  function performCalculate(targetMode: LoanMode, options: { updateUrl: boolean }) {
    const interestRateValue = parseLocalizedNumber(interestRate) || 0;
    // Clamped to MAX_LOAN_TERM_YEARS: an unbounded term (typed directly, or via a URL query
    // param) would make the amortization loop run an unbounded number of iterations.
    const termYearsValue = Math.min(Math.max(termToYears(termValue, termUnit), 0), MAX_LOAN_TERM_YEARS);
    const params: ResolvedParams = { interestRate: interestRateValue, termYears: termYearsValue, compoundFrequency, paymentFrequency };

    if (targetMode === "amortized") {
      const loanAmountValue = parseLocalizedNumber(loanAmount) || 0;
      setAmortizedResult(calculateAmortizedLoan(loanAmountValue, interestRateValue, termYearsValue, compoundFrequency, paymentFrequency));
      setAmortizedParams(params);
    } else if (targetMode === "deferred") {
      const loanAmountValue = parseLocalizedNumber(loanAmount) || 0;
      setDeferredResult(calculateDeferredPaymentLoan(loanAmountValue, interestRateValue, termYearsValue, compoundFrequency));
      setDeferredParams(params);
    } else {
      const dueAmountValue = parseLocalizedNumber(dueAmount) || 0;
      setBondResult(calculateBond(dueAmountValue, interestRateValue, termYearsValue, compoundFrequency));
      setBondParams(params);
    }

    setDigitStyle(resolveDigitStyle(loanAmount, dueAmount, interestRate, termValue));
    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));

    if (options.updateUrl) {
      const params2 = new URLSearchParams();
      params2.set(QUERY_PARAM_KEYS.mode, targetMode);
      params2.set(QUERY_PARAM_KEYS.loanAmount, loanAmount);
      params2.set(QUERY_PARAM_KEYS.dueAmount, dueAmount);
      params2.set(QUERY_PARAM_KEYS.interestRate, interestRate);
      params2.set(QUERY_PARAM_KEYS.termValue, termValue);
      params2.set(QUERY_PARAM_KEYS.termUnit, termUnit);
      params2.set(QUERY_PARAM_KEYS.compound, compoundFrequency);
      params2.set(QUERY_PARAM_KEYS.payFrequency, paymentFrequency);
      params2.set(QUERY_PARAM_KEYS.currency, currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params2.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately (converting loanAmount/dueAmount in place and recomputing every tab
  // visited so far) rather than waiting for an explicit Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);
    const convertedLoanAmount = convert(loanAmount);
    const convertedDueAmount = convert(dueAmount);

    setLoanAmount(convertedLoanAmount);
    setDueAmount(convertedDueAmount);
    setCurrency(next);

    const interestRateValue = parseLocalizedNumber(interestRate) || 0;
    const termYearsValue = Math.min(Math.max(termToYears(termValue, termUnit), 0), MAX_LOAN_TERM_YEARS);
    const loanAmountValue = parseLocalizedNumber(convertedLoanAmount) || 0;
    const dueAmountValue = parseLocalizedNumber(convertedDueAmount) || 0;

    if (initializedModes.amortized) setAmortizedResult(calculateAmortizedLoan(loanAmountValue, interestRateValue, termYearsValue, compoundFrequency, paymentFrequency));
    if (initializedModes.deferred) setDeferredResult(calculateDeferredPaymentLoan(loanAmountValue, interestRateValue, termYearsValue, compoundFrequency));
    if (initializedModes.bond) setBondResult(calculateBond(dueAmountValue, interestRateValue, termYearsValue, compoundFrequency));

    const params2 = new URLSearchParams();
    params2.set(QUERY_PARAM_KEYS.mode, mode);
    params2.set(QUERY_PARAM_KEYS.loanAmount, convertedLoanAmount);
    params2.set(QUERY_PARAM_KEYS.dueAmount, convertedDueAmount);
    params2.set(QUERY_PARAM_KEYS.interestRate, interestRate);
    params2.set(QUERY_PARAM_KEYS.termValue, termValue);
    params2.set(QUERY_PARAM_KEYS.termUnit, termUnit);
    params2.set(QUERY_PARAM_KEYS.compound, compoundFrequency);
    params2.set(QUERY_PARAM_KEYS.payFrequency, paymentFrequency);
    params2.set(QUERY_PARAM_KEYS.currency, next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params2.toString()}`);
  }

  // Switching to a tab that's never been visited auto-computes its result from whatever is
  // currently in the shared fields, matching calculator.net's "instant result" behavior — without
  // writing to the URL, which stays clean until the user explicitly presses Calculate. Handled
  // here in the event handler (not an effect) so the state update isn't a reactive side effect.
  function handleModeChange(newMode: LoanMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  function handleClear() {
    setLoanAmount(DEFAULTS.loanAmount);
    setDueAmount(DEFAULTS.dueAmount);
    setInterestRate(DEFAULTS.interestRate);
    setTermValue(DEFAULTS.termValue);
    setTermUnit("years");
    setCompoundFrequency("monthly");
    setPaymentFrequency("monthly");
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "amortization", label: tNav("amortization") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const activeCalculated = hasCalculated[mode];

  const heroLabel =
    mode === "amortized" ? t("aboveFold.resultLabels.payment") : mode === "deferred" ? t("aboveFold.resultLabels.amountDue") : t("aboveFold.resultLabels.amountReceived");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });
  const percent = (value: number) => formatLocalizedNumber(value / 100, digitStyle, { style: "percent", maximumFractionDigits: 2 });
  const yearsText = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })} ${t("aboveFold.yearsUnit")}`;

  const heroValueRaw = mode === "amortized" ? amortizedResult.payment : mode === "deferred" ? deferredResult.amountDue : bondResult.amountReceived;

  const sentenceKey = `aboveFold.sentences.${mode}`;
  const sentence =
    mode === "amortized"
      ? t(sentenceKey, {
          amount: money(amortizedResult.loanAmount),
          rate: percent(amortizedParams.interestRate),
          term: yearsText(amortizedParams.termYears),
          payment: money(amortizedResult.payment),
        })
      : mode === "deferred"
        ? t(sentenceKey, {
            amount: money(deferredResult.loanAmount),
            rate: percent(deferredParams.interestRate),
            term: yearsText(deferredParams.termYears),
            due: money(deferredResult.amountDue),
          })
        : t(sentenceKey, {
            due: money(bondResult.dueAmount),
            rate: percent(bondParams.interestRate),
            term: yearsText(bondParams.termYears),
            received: money(bondResult.amountReceived),
          });

  const principalForDonut = mode === "amortized" ? amortizedResult.loanAmount : mode === "deferred" ? deferredResult.loanAmount : bondResult.amountReceived;
  const totalInterest = mode === "amortized" ? amortizedResult.totalInterest : mode === "deferred" ? deferredResult.totalInterest : bondResult.totalInterest;
  const activeParams = mode === "amortized" ? amortizedParams : mode === "deferred" ? deferredParams : bondParams;

  return (
    <LoanLiveInputsProvider value={{ hasCalculatedAmortized: hasCalculated.amortized, amortizedSchedule: amortizedResult.schedule, digitStyle, currency }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <LoanInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              loanAmount={loanAmount}
              onLoanAmountChange={setLoanAmount}
              dueAmount={dueAmount}
              onDueAmountChange={setDueAmount}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              termValue={termValue}
              onTermValueChange={setTermValue}
              termUnit={termUnit}
              onTermUnitChange={setTermUnit}
              compoundFrequency={compoundFrequency}
              onCompoundFrequencyChange={setCompoundFrequency}
              paymentFrequency={paymentFrequency}
              onPaymentFrequencyChange={setPaymentFrequency}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <LoanResult
                mode={mode}
                currency={currency}
                hasCalculated={activeCalculated}
                heroLabel={heroLabel}
                heroValue={money(heroValueRaw)}
                sentence={sentence}
                principalForDonut={principalForDonut}
                totalInterest={totalInterest}
                digitStyle={digitStyle}
                loanAmount={mode === "bond" ? bondResult.amountReceived : mode === "amortized" ? amortizedResult.loanAmount : deferredResult.loanAmount}
                dueAmount={mode === "bond" ? bondResult.dueAmount : deferredResult.amountDue}
                interestRate={activeParams.interestRate}
                termYears={activeParams.termYears}
                compoundFrequency={activeParams.compoundFrequency}
                paymentFrequency={activeParams.paymentFrequency}
                paymentSchedule={amortizedResult.schedule}
                growthSchedule={mode === "bond" ? bondResult.schedule : deferredResult.schedule}
              />
              <LoanModeTabs mode={mode} onModeChange={handleModeChange} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="loan-calculator"
              category="calculators"
              relatedList={["mortgage-calculator", "affordable-loan-calculator", "compound-interest-calculator", "retirement-calculator"]}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />

              {activeCalculated && mode === "amortized" && (
                <>
                  <LoanAmortizationChart schedule={amortizedResult.schedule} loanAmount={amortizedResult.loanAmount} totalInterest={amortizedResult.totalInterest} digitStyle={digitStyle} currency={currency} />
                  <LoanAmortizationTable schedule={amortizedResult.schedule} digitStyle={digitStyle} currency={currency} />
                </>
              )}
              {activeCalculated && mode === "deferred" && (
                <>
                  <LoanGrowthChart schedule={deferredResult.schedule} loanAmount={deferredResult.loanAmount} totalInterest={deferredResult.totalInterest} digitStyle={digitStyle} currency={currency} titleKey="deferredGrowthChart" />
                  <LoanGrowthTable schedule={deferredResult.schedule} digitStyle={digitStyle} currency={currency} />
                </>
              )}
              {activeCalculated && mode === "bond" && (
                <>
                  <LoanGrowthChart schedule={bondResult.schedule} loanAmount={bondResult.amountReceived} totalInterest={bondResult.totalInterest} digitStyle={digitStyle} currency={currency} titleKey="bondGrowthChart" />
                  <LoanGrowthTable schedule={bondResult.schedule} digitStyle={digitStyle} currency={currency} />
                </>
              )}

              <LoanDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </LoanLiveInputsProvider>
  );
}
