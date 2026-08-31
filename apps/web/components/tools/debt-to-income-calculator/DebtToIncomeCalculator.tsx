"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateDebtToIncome, calculateMaxAllowedDebt, type DebtToIncomeResult as RatioResult, type MaxAllowedDebtResult } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DebtToIncomeModeTabs from "./DebtToIncomeModeTabs";
import DebtToIncomeInputPanel from "./DebtToIncomeInputPanel";
import DebtToIncomeResult from "./DebtToIncomeResult";
import DebtToIncomeScenarioChart from "./DebtToIncomeScenarioChart";
import type { DtiMode } from "./types";

const DEFAULTS = {
  monthlyGrossIncome: "6000",
  housingPayment: "1500",
  carPayments: "300",
  studentLoanPayments: "200",
  creditCardPayments: "100",
  otherPayments: "0",
  targetBackEndRatio: "36",
  existingMonthlyDebt: "600",
  proposedMonthlyPayment: "250",
};

const EMPTY_MAX_DEBT: MaxAllowedDebtResult = { maxTotalMonthlyDebt: 0, maxAdditionalMonthlyDebt: 0, currentOtherDebt: 0 };
const EMPTY_RATIO: RatioResult = { totalMonthlyDebt: 0, frontEndRatio: 0, backEndRatio: 0, category: "healthy" };

const QUERY_PARAM_KEYS = {
  mode: "mode",
  income: "income",
  housing: "housing",
  car: "car",
  student: "student",
  creditCard: "creditCard",
  other: "other",
  targetRatio: "targetRatio",
  existingDebt: "existingDebt",
  proposedPayment: "proposedPayment",
  currency: "currency",
} as const;

function computeRatioResult(inputs: typeof DEFAULTS): RatioResult {
  return calculateDebtToIncome(
    parseLocalizedNumber(inputs.monthlyGrossIncome) || 0,
    parseLocalizedNumber(inputs.housingPayment) || 0,
    parseLocalizedNumber(inputs.carPayments) || 0,
    parseLocalizedNumber(inputs.studentLoanPayments) || 0,
    parseLocalizedNumber(inputs.creditCardPayments) || 0,
    parseLocalizedNumber(inputs.otherPayments) || 0
  );
}

function computeMaxDebtResult(inputs: typeof DEFAULTS): MaxAllowedDebtResult {
  return calculateMaxAllowedDebt(
    parseLocalizedNumber(inputs.monthlyGrossIncome) || 0,
    parseLocalizedNumber(inputs.targetBackEndRatio) || 0,
    parseLocalizedNumber(inputs.existingMonthlyDebt) || 0
  );
}

/**
 * The "Scenario Comparison" tab reuses `calculateDebtToIncome` twice rather than adding a new
 * engine function: once with today's debts (before), once with the proposed new payment folded
 * into the "other" category (after) — the ratio math is identical either way, so no new
 * calculation logic is needed, only a second call with a different input.
 */
function computeScenarioResult(inputs: typeof DEFAULTS): { before: RatioResult; after: RatioResult } {
  const income = parseLocalizedNumber(inputs.monthlyGrossIncome) || 0;
  const housing = parseLocalizedNumber(inputs.housingPayment) || 0;
  const car = parseLocalizedNumber(inputs.carPayments) || 0;
  const student = parseLocalizedNumber(inputs.studentLoanPayments) || 0;
  const creditCard = parseLocalizedNumber(inputs.creditCardPayments) || 0;
  const other = parseLocalizedNumber(inputs.otherPayments) || 0;
  const proposedPayment = parseLocalizedNumber(inputs.proposedMonthlyPayment) || 0;

  const before = calculateDebtToIncome(income, housing, car, student, creditCard, other);
  const after = calculateDebtToIncome(income, housing, car, student, creditCard, other + proposedPayment);
  return { before, after };
}

export default function DebtToIncomeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.debt-to-income-calculator.nav");

  const [mode, setMode] = useState<DtiMode>("ratio");

  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState(DEFAULTS.monthlyGrossIncome);
  const [housingPayment, setHousingPayment] = useState(DEFAULTS.housingPayment);
  const [carPayments, setCarPayments] = useState(DEFAULTS.carPayments);
  const [studentLoanPayments, setStudentLoanPayments] = useState(DEFAULTS.studentLoanPayments);
  const [creditCardPayments, setCreditCardPayments] = useState(DEFAULTS.creditCardPayments);
  const [otherPayments, setOtherPayments] = useState(DEFAULTS.otherPayments);
  const [targetBackEndRatio, setTargetBackEndRatio] = useState(DEFAULTS.targetBackEndRatio);
  const [existingMonthlyDebt, setExistingMonthlyDebt] = useState(DEFAULTS.existingMonthlyDebt);
  const [proposedMonthlyPayment, setProposedMonthlyPayment] = useState(DEFAULTS.proposedMonthlyPayment);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [ratioResult, setRatioResult] = useState<RatioResult>(() => computeRatioResult(DEFAULTS));
  const [maxDebtResult, setMaxDebtResult] = useState<MaxAllowedDebtResult>(EMPTY_MAX_DEBT);
  const [scenarioBefore, setScenarioBefore] = useState<RatioResult>(EMPTY_RATIO);
  const [scenarioAfter, setScenarioAfter] = useState<RatioResult>(EMPTY_RATIO);
  const [hasCalculated, setHasCalculated] = useState<Record<DtiMode, boolean>>({ ratio: true, maxDebt: false, scenario: false });
  const [initializedModes, setInitializedModes] = useState<Record<DtiMode, boolean>>({ ratio: true, maxDebt: false, scenario: false });

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

  function performCalculate(targetMode: DtiMode, options: { updateUrl: boolean }) {
    const inputs = {
      monthlyGrossIncome,
      housingPayment,
      carPayments,
      studentLoanPayments,
      creditCardPayments,
      otherPayments,
      targetBackEndRatio,
      existingMonthlyDebt,
      proposedMonthlyPayment,
    };

    if (targetMode === "ratio") {
      setRatioResult(computeRatioResult(inputs));
    } else if (targetMode === "maxDebt") {
      setMaxDebtResult(computeMaxDebtResult(inputs));
    } else {
      const scenario = computeScenarioResult(inputs);
      setScenarioBefore(scenario.before);
      setScenarioAfter(scenario.after);
    }

    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(
      resolveDigitStyle(monthlyGrossIncome, housingPayment, carPayments, studentLoanPayments, creditCardPayments, otherPayments, targetBackEndRatio, existingMonthlyDebt, proposedMonthlyPayment)
    );

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set(QUERY_PARAM_KEYS.mode, targetMode);
      params.set(QUERY_PARAM_KEYS.income, monthlyGrossIncome);
      params.set(QUERY_PARAM_KEYS.housing, housingPayment);
      params.set(QUERY_PARAM_KEYS.car, carPayments);
      params.set(QUERY_PARAM_KEYS.student, studentLoanPayments);
      params.set(QUERY_PARAM_KEYS.creditCard, creditCardPayments);
      params.set(QUERY_PARAM_KEYS.other, otherPayments);
      params.set(QUERY_PARAM_KEYS.targetRatio, targetBackEndRatio);
      params.set(QUERY_PARAM_KEYS.existingDebt, existingMonthlyDebt);
      params.set(QUERY_PARAM_KEYS.proposedPayment, proposedMonthlyPayment);
      params.set(QUERY_PARAM_KEYS.currency, currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  function handleModeChange(newMode: DtiMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately (converting every money-denominated field in place and recomputing
  // every tab visited so far) rather than waiting for an explicit Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);

    const convertedIncome = convert(monthlyGrossIncome);
    const convertedHousing = convert(housingPayment);
    const convertedCar = convert(carPayments);
    const convertedStudent = convert(studentLoanPayments);
    const convertedCreditCard = convert(creditCardPayments);
    const convertedOther = convert(otherPayments);
    const convertedExistingDebt = convert(existingMonthlyDebt);
    const convertedProposedPayment = convert(proposedMonthlyPayment);

    setMonthlyGrossIncome(convertedIncome);
    setHousingPayment(convertedHousing);
    setCarPayments(convertedCar);
    setStudentLoanPayments(convertedStudent);
    setCreditCardPayments(convertedCreditCard);
    setOtherPayments(convertedOther);
    setExistingMonthlyDebt(convertedExistingDebt);
    setProposedMonthlyPayment(convertedProposedPayment);
    setCurrency(next);

    const convertedInputs = {
      monthlyGrossIncome: convertedIncome,
      housingPayment: convertedHousing,
      carPayments: convertedCar,
      studentLoanPayments: convertedStudent,
      creditCardPayments: convertedCreditCard,
      otherPayments: convertedOther,
      targetBackEndRatio,
      existingMonthlyDebt: convertedExistingDebt,
      proposedMonthlyPayment: convertedProposedPayment,
    };

    if (initializedModes.ratio) setRatioResult(computeRatioResult(convertedInputs));
    if (initializedModes.maxDebt) setMaxDebtResult(computeMaxDebtResult(convertedInputs));
    if (initializedModes.scenario) {
      const scenario = computeScenarioResult(convertedInputs);
      setScenarioBefore(scenario.before);
      setScenarioAfter(scenario.after);
    }

    const params = new URLSearchParams();
    params.set(QUERY_PARAM_KEYS.mode, mode);
    params.set(QUERY_PARAM_KEYS.income, convertedIncome);
    params.set(QUERY_PARAM_KEYS.housing, convertedHousing);
    params.set(QUERY_PARAM_KEYS.car, convertedCar);
    params.set(QUERY_PARAM_KEYS.student, convertedStudent);
    params.set(QUERY_PARAM_KEYS.creditCard, convertedCreditCard);
    params.set(QUERY_PARAM_KEYS.other, convertedOther);
    params.set(QUERY_PARAM_KEYS.targetRatio, targetBackEndRatio);
    params.set(QUERY_PARAM_KEYS.existingDebt, convertedExistingDebt);
    params.set(QUERY_PARAM_KEYS.proposedPayment, convertedProposedPayment);
    params.set(QUERY_PARAM_KEYS.currency, next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function handleClear() {
    setMonthlyGrossIncome(DEFAULTS.monthlyGrossIncome);
    setHousingPayment(DEFAULTS.housingPayment);
    setCarPayments(DEFAULTS.carPayments);
    setStudentLoanPayments(DEFAULTS.studentLoanPayments);
    setCreditCardPayments(DEFAULTS.creditCardPayments);
    setOtherPayments(DEFAULTS.otherPayments);
    setTargetBackEndRatio(DEFAULTS.targetBackEndRatio);
    setExistingMonthlyDebt(DEFAULTS.existingMonthlyDebt);
    setProposedMonthlyPayment(DEFAULTS.proposedMonthlyPayment);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
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
            <DebtToIncomeInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              monthlyGrossIncome={monthlyGrossIncome}
              onMonthlyGrossIncomeChange={setMonthlyGrossIncome}
              housingPayment={housingPayment}
              onHousingPaymentChange={setHousingPayment}
              carPayments={carPayments}
              onCarPaymentsChange={setCarPayments}
              studentLoanPayments={studentLoanPayments}
              onStudentLoanPaymentsChange={setStudentLoanPayments}
              creditCardPayments={creditCardPayments}
              onCreditCardPaymentsChange={setCreditCardPayments}
              otherPayments={otherPayments}
              onOtherPaymentsChange={setOtherPayments}
              targetBackEndRatio={targetBackEndRatio}
              onTargetBackEndRatioChange={setTargetBackEndRatio}
              existingMonthlyDebt={existingMonthlyDebt}
              onExistingMonthlyDebtChange={setExistingMonthlyDebt}
              proposedMonthlyPayment={proposedMonthlyPayment}
              onProposedMonthlyPaymentChange={setProposedMonthlyPayment}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <DebtToIncomeResult
                mode={mode}
                currency={currency}
                hasCalculated={hasCalculated[mode]}
                digitStyle={digitStyle}
                monthlyGrossIncome={parseLocalizedNumber(monthlyGrossIncome) || 0}
                ratioResult={ratioResult}
                maxDebtResult={maxDebtResult}
                targetBackEndRatio={parseLocalizedNumber(targetBackEndRatio) || 0}
                scenarioBefore={scenarioBefore}
                scenarioAfter={scenarioAfter}
                proposedMonthlyPayment={parseLocalizedNumber(proposedMonthlyPayment) || 0}
              />
              <DebtToIncomeModeTabs mode={mode} onModeChange={handleModeChange} />
              {mode === "scenario" && (
                <DebtToIncomeScenarioChart hasCalculated={hasCalculated.scenario} before={scenarioBefore} after={scenarioAfter} digitStyle={digitStyle} currency={currency} />
              )}
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="debt-to-income-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} visible={navBarVisible} />}
        />
      </div>

      {education}
    </>
  );
}
