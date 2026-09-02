"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateCompoundInterest,
  solveInvestmentLength,
  solveReturnRate,
  solveStartingAmount,
  solveAdditionalContribution,
  COMPOUNDING_PERIODS_PER_YEAR,
  type CompoundInterestResult as CompoundInterestEngineResult,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, isSupportedCurrency, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PlainDisclaimer from "@/components/tool-ui/PlainDisclaimer";
import CompoundInterestModeTabs from "./CompoundInterestModeTabs";
import RuleOf72Card from "./RuleOf72Card";
import CompoundInterestInputPanel from "./CompoundInterestInputPanel";
import CompoundInterestResult from "./CompoundInterestResult";
import CompoundInterestGrowthChart from "./CompoundInterestGrowthChart";
import CompoundInterestYearlyBreakdownTable from "./CompoundInterestYearlyBreakdownTable";
import { CompoundInterestLiveInputsProvider } from "./CompoundInterestLiveInputsContext";
import { SOLVE_MODES, type CompoundingFrequency, type SolveMode } from "./types";

const VALID_FREQUENCIES = Object.keys(COMPOUNDING_PERIODS_PER_YEAR) as CompoundingFrequency[];
const MAX_SOLVE_YEARS = 100;

const RELATED_TOOLS_BY_MODE: Record<SolveMode, string[]> = {
  endAmount: ["mortgage-calculator", "retirement-calculator", "loan-calculator"],
  investmentLength: ["retirement-calculator", "debt-to-income-calculator", "affordable-loan-calculator"],
  returnRate: ["loan-calculator", "affordable-loan-calculator", "mortgage-calculator"],
  startingAmount: ["retirement-calculator", "affordable-loan-calculator", "mortgage-calculator"],
  additionalContribution: ["loan-calculator", "mortgage-calculator", "retirement-calculator"],
};

const QUERY_PARAM_KEYS = {
  mode: "mode",
  principal: "amount",
  rate: "rate",
  years: "years",
  frequency: "compound",
  monthlyContribution: "contribution",
  targetAmount: "target",
  taxRate: "tax",
  inflationRate: "inflation",
  currency: "currency",
} as const;

const DEFAULTS = {
  principal: "10000",
  rate: "7",
  years: "10",
  frequency: "monthly" as CompoundingFrequency,
  monthlyContribution: "100",
  targetAmount: "50000",
  taxRate: "0",
  inflationRate: "0",
};

type ComputationInputs = {
  principal: string;
  rate: string;
  years: string;
  frequency: CompoundingFrequency;
  monthlyContribution: string;
  targetAmount: string;
  taxRate: string;
  inflationRate: string;
};

type ComputationResult = {
  forward: CompoundInterestEngineResult;
  resolvedPrincipal: number;
  resolvedRate: number;
  resolvedYears: number;
  resolvedContribution: number;
  effectiveTaxRate: number;
  targetAmount: number;
  unreachable: boolean;
};

const EMPTY_ENGINE_RESULT = (principal: number): CompoundInterestEngineResult => ({
  futureValue: principal,
  principal,
  totalContributions: 0,
  totalInterest: 0,
  yearlySchedule: [],
  monthlySchedule: [],
  buyingPowerAfterInflation: principal,
});

const EMPTY_RESULT: ComputationResult = {
  forward: EMPTY_ENGINE_RESULT(0),
  resolvedPrincipal: 0,
  resolvedRate: 0,
  resolvedYears: 0,
  resolvedContribution: 0,
  effectiveTaxRate: 0,
  targetAmount: 0,
  unreachable: false,
};

// Pure computation, shared by the explicit Calculate button, first-visit auto-calculation, and
// URL-hydration on mount — takes explicit inputs rather than reading component state, so it can
// be called safely from a mount effect without depending on state having already flushed.
function computeResult(mode: SolveMode, inputs: ComputationInputs): ComputationResult {
  const principalValue = parseLocalizedNumber(inputs.principal) || 0;
  const rateValue = parseLocalizedNumber(inputs.rate) || 0;
  // Clamped to MAX_SOLVE_YEARS: an unbounded value here (typed directly, or supplied via a URL
  // query param) would make calculateCompoundInterest's month-by-month loop run an unbounded
  // number of iterations and freeze the tab — and in "Return Rate" mode, the bisection solver
  // calls that same loop ~60 times, multiplying the cost further.
  const yearsValue = Math.min(Math.max(parseLocalizedNumber(inputs.years) || 0, 0), MAX_SOLVE_YEARS);
  const contributionValue = parseLocalizedNumber(inputs.monthlyContribution) || 0;
  const targetValue = parseLocalizedNumber(inputs.targetAmount) || 0;
  const taxRateValue = parseLocalizedNumber(inputs.taxRate) || 0;
  const inflationRateValue = parseLocalizedNumber(inputs.inflationRate) || 0;
  const effectiveTaxRate = mode === "endAmount" ? taxRateValue : 0;
  const effectiveInflationRate = mode === "endAmount" ? inflationRateValue : 0;

  let resolvedPrincipal = principalValue;
  let resolvedRate = rateValue;
  let resolvedYears = yearsValue;
  let resolvedContribution = contributionValue;
  let unreachable = false;

  if (mode === "investmentLength") {
    const solved = solveInvestmentLength(targetValue, principalValue, rateValue, inputs.frequency, contributionValue, MAX_SOLVE_YEARS);
    unreachable = solved === null;
    resolvedYears = solved ?? MAX_SOLVE_YEARS;
  } else if (mode === "returnRate") {
    const solved = solveReturnRate(targetValue, principalValue, yearsValue, inputs.frequency, contributionValue);
    unreachable = solved === null;
    resolvedRate = solved ?? 0;
  } else if (mode === "startingAmount") {
    resolvedPrincipal = solveStartingAmount(targetValue, rateValue, yearsValue, inputs.frequency, contributionValue);
  } else if (mode === "additionalContribution") {
    resolvedContribution = solveAdditionalContribution(targetValue, principalValue, rateValue, yearsValue, inputs.frequency);
  }

  const forward =
    resolvedYears > 0
      ? calculateCompoundInterest(resolvedPrincipal, resolvedRate, resolvedYears, inputs.frequency, resolvedContribution, effectiveTaxRate, effectiveInflationRate)
      : EMPTY_ENGINE_RESULT(resolvedPrincipal);

  return {
    forward,
    resolvedPrincipal,
    resolvedRate,
    resolvedYears,
    resolvedContribution,
    effectiveTaxRate,
    targetAmount: targetValue,
    unreachable,
  };
}

export default function CompoundInterestCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.compound-interest-calculator.nav");
  const t = useTranslations("tools.compound-interest-calculator");

  const [mode, setMode] = useState<SolveMode>("endAmount");
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [frequency, setFrequency] = useState<CompoundingFrequency>(DEFAULTS.frequency);
  const [monthlyContribution, setMonthlyContribution] = useState(DEFAULTS.monthlyContribution);
  const [targetAmount, setTargetAmount] = useState(DEFAULTS.targetAmount);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  const [inflationRate, setInflationRate] = useState(DEFAULTS.inflationRate);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // The End Amount tab (the default active tab) starts pre-calculated from the default field
  // values, computed once as a lazy useState initializer — present in the very first render
  // (including SSR), matching calculator.net-style "instant result on load" behavior with no
  // empty-state flash. The other four tabs stay uncalculated until first visited or Calculated.
  const [results, setResults] = useState<Record<SolveMode, ComputationResult>>(() => ({
    endAmount: computeResult("endAmount", DEFAULTS),
    investmentLength: EMPTY_RESULT,
    returnRate: EMPTY_RESULT,
    startingAmount: EMPTY_RESULT,
    additionalContribution: EMPTY_RESULT,
  }));
  const [hasCalculated, setHasCalculated] = useState<Record<SolveMode, boolean>>({
    endAmount: true,
    investmentLength: false,
    returnRate: false,
    startingAmount: false,
    additionalContribution: false,
  });
  // Tracks which tabs have ever shown a result — unlike hasCalculated, Clear does NOT reset this,
  // so returning to a tab you just cleared stays empty instead of auto-recalculating again.
  const [initializedModes, setInitializedModes] = useState<Record<SolveMode, boolean>>({
    endAmount: true,
    investmentLength: false,
    returnRate: false,
    startingAmount: false,
    additionalContribution: false,
  });

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  // Keeps SectionNav invisible (but still in flow, so no layout shift) until the page
  // title above it has fully scrolled past — otherwise, once the bar's own sticky logic
  // kicks in, it floats at a fixed top offset and can overlap the still-visible title on
  // this tool specifically, since its now-taller input column (five mode tabs plus up to
  // eight fields) pushes SectionNav's own sentinel below the fold, which makes that
  // sentinel read as "not intersecting" on mount — indistinguishable, from that signal
  // alone, from having actually scrolled past it. Tracking a second, near-top sentinel
  // here and gating visibility independently sidesteps that without touching SectionNav's
  // own sticky logic (shared by every other tool on the site).
  // Two observers with different rootMargins, rather than one threshold checked against
  // `boundingClientRect.top`, deliberately open up a dead zone between "show" and "hide"
  // triggers. A single hard threshold flickers on the frame-to-frame sub-pixel jitter
  // IntersectionObserver reports during momentum scrolling — the boundingClientRect.top
  // read for the same visually-settled scroll position can land a fraction of a pixel on
  // either side of 0 from one callback to the next, so a plain `top < 0` comparison (or an
  // equivalent single-margin observer) toggles state repeatedly right at the crossing
  // point. Requiring the element to clear a deeper line before showing, and rise back
  // above a shallower one before hiding, means that jitter has to move the sentinel more
  // than the gap between the two lines before it can flip anything.
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

  // Hydrating state from window.location on mount is the standard hydration-safe pattern for
  // browser-only URL state (window isn't available during SSR/SSG for these prerendered tool
  // pages). If the URL carries no params at all, this is a no-op — the lazily-initialized
  // End Amount default above already covers that (by far the most common) case, and the URL
  // itself stays untouched until the user explicitly presses Calculate.
  /* eslint-disable react-hooks/set-state-in-effect -- mount-only sync from the URL, not derived from React state/props */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return;

    const modeParam = params.get(QUERY_PARAM_KEYS.mode);
    const effectiveMode: SolveMode = modeParam && (SOLVE_MODES as string[]).includes(modeParam) ? (modeParam as SolveMode) : "endAmount";
    const frequencyParam = params.get(QUERY_PARAM_KEYS.frequency);
    const effectiveInputs: ComputationInputs = {
      principal: params.get(QUERY_PARAM_KEYS.principal) ?? DEFAULTS.principal,
      rate: params.get(QUERY_PARAM_KEYS.rate) ?? DEFAULTS.rate,
      years: params.get(QUERY_PARAM_KEYS.years) ?? DEFAULTS.years,
      frequency: frequencyParam && VALID_FREQUENCIES.includes(frequencyParam as CompoundingFrequency) ? (frequencyParam as CompoundingFrequency) : DEFAULTS.frequency,
      monthlyContribution: params.get(QUERY_PARAM_KEYS.monthlyContribution) ?? DEFAULTS.monthlyContribution,
      targetAmount: params.get(QUERY_PARAM_KEYS.targetAmount) ?? DEFAULTS.targetAmount,
      taxRate: params.get(QUERY_PARAM_KEYS.taxRate) ?? DEFAULTS.taxRate,
      inflationRate: params.get(QUERY_PARAM_KEYS.inflationRate) ?? DEFAULTS.inflationRate,
    };

    const currencyParam = params.get(QUERY_PARAM_KEYS.currency);
    setCurrency(isSupportedCurrency(currencyParam) ? currencyParam : DEFAULT_CURRENCY);

    setMode(effectiveMode);
    setPrincipal(effectiveInputs.principal);
    setRate(effectiveInputs.rate);
    setYears(effectiveInputs.years);
    setFrequency(effectiveInputs.frequency);
    setMonthlyContribution(effectiveInputs.monthlyContribution);
    setTargetAmount(effectiveInputs.targetAmount);
    setTaxRate(effectiveInputs.taxRate);
    setInflationRate(effectiveInputs.inflationRate);
    setDigitStyle(
      resolveDigitStyle(effectiveInputs.principal, effectiveInputs.rate, effectiveInputs.years, effectiveInputs.monthlyContribution, effectiveInputs.targetAmount)
    );

    const result = computeResult(effectiveMode, effectiveInputs);
    setResults((prev) => ({ ...prev, [effectiveMode]: result }));
    setHasCalculated((prev) => ({ ...prev, [effectiveMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [effectiveMode]: true }));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Shared by the explicit Calculate button and the first-visit auto-calculation, so both paths
  // use identical math and both mark the tab as initialized — only the explicit path touches the
  // URL, keeping it clean until the user actually presses Calculate.
  function performCalculate(targetMode: SolveMode, options: { updateUrl: boolean }) {
    const inputs: ComputationInputs = { principal, rate, years, frequency, monthlyContribution, targetAmount, taxRate, inflationRate };
    const result = computeResult(targetMode, inputs);

    setResults((prev) => ({ ...prev, [targetMode]: result }));
    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(resolveDigitStyle(principal, rate, years, monthlyContribution, targetAmount));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set(QUERY_PARAM_KEYS.mode, targetMode);
      params.set(QUERY_PARAM_KEYS.principal, principal);
      params.set(QUERY_PARAM_KEYS.rate, rate);
      params.set(QUERY_PARAM_KEYS.years, years);
      params.set(QUERY_PARAM_KEYS.frequency, frequency);
      params.set(QUERY_PARAM_KEYS.monthlyContribution, monthlyContribution);
      params.set(QUERY_PARAM_KEYS.targetAmount, targetAmount);
      params.set(QUERY_PARAM_KEYS.taxRate, taxRate);
      params.set(QUERY_PARAM_KEYS.inflationRate, inflationRate);
      params.set(QUERY_PARAM_KEYS.currency, currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  // Currency is a pure unit conversion on already-entered amounts, not a new calculation — so it
  // takes effect immediately (converting every money-denominated field in place and recomputing
  // every tab visited so far) rather than waiting for an explicit Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convert = (value: string) => convertAmountString(value, currency, next, (raw) => parseLocalizedNumber(raw) || 0);

    const convertedPrincipal = convert(principal);
    const convertedContribution = convert(monthlyContribution);
    const convertedTarget = convert(targetAmount);

    setPrincipal(convertedPrincipal);
    setMonthlyContribution(convertedContribution);
    setTargetAmount(convertedTarget);
    setCurrency(next);

    const convertedInputs: ComputationInputs = {
      principal: convertedPrincipal,
      rate,
      years,
      frequency,
      monthlyContribution: convertedContribution,
      targetAmount: convertedTarget,
      taxRate,
      inflationRate,
    };
    setResults((prev) => {
      const updated = { ...prev };
      (Object.keys(initializedModes) as SolveMode[]).forEach((m) => {
        if (initializedModes[m]) updated[m] = computeResult(m, convertedInputs);
      });
      return updated;
    });

    const params = new URLSearchParams();
    params.set(QUERY_PARAM_KEYS.mode, mode);
    params.set(QUERY_PARAM_KEYS.principal, convertedPrincipal);
    params.set(QUERY_PARAM_KEYS.rate, rate);
    params.set(QUERY_PARAM_KEYS.years, years);
    params.set(QUERY_PARAM_KEYS.frequency, frequency);
    params.set(QUERY_PARAM_KEYS.monthlyContribution, convertedContribution);
    params.set(QUERY_PARAM_KEYS.targetAmount, convertedTarget);
    params.set(QUERY_PARAM_KEYS.taxRate, taxRate);
    params.set(QUERY_PARAM_KEYS.inflationRate, inflationRate);
    params.set(QUERY_PARAM_KEYS.currency, next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  // Switching to a tab that's never been visited auto-computes its result from whatever is
  // currently in the shared fields, matching calculator.net's "instant result" behavior — without
  // writing to the URL, which stays clean until the user explicitly presses Calculate. Handled
  // here in the event handler (not an effect) so the state update isn't a reactive side effect.
  function handleModeChange(newMode: SolveMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  function handleClear() {
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setFrequency(DEFAULTS.frequency);
    setMonthlyContribution(DEFAULTS.monthlyContribution);
    setTargetAmount(DEFAULTS.targetAmount);
    setTaxRate(DEFAULTS.taxRate);
    setInflationRate(DEFAULTS.inflationRate);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  const activeCalculated = hasCalculated[mode];
  const computation = results[mode];

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "yearly-breakdown", label: tNav("yearlyBreakdown") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <CompoundInterestLiveInputsProvider
      value={{
        hasCalculated: activeCalculated,
        currency,
        principal: computation.forward.principal,
        rate: computation.resolvedRate,
        years: computation.resolvedYears,
        frequency,
        monthlyContribution: computation.resolvedContribution,
        taxRate: computation.effectiveTaxRate,
        yearlySchedule: computation.forward.yearlySchedule,
        digitStyle,
      }}
    >
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <CompoundInterestInputPanel
              mode={mode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              principal={principal}
              onPrincipalChange={setPrincipal}
              rate={rate}
              onRateChange={setRate}
              years={years}
              onYearsChange={setYears}
              frequency={frequency}
              onFrequencyChange={setFrequency}
              monthlyContribution={monthlyContribution}
              onMonthlyContributionChange={setMonthlyContribution}
              targetAmount={targetAmount}
              onTargetAmountChange={setTargetAmount}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              inflationRate={inflationRate}
              onInflationRateChange={setInflationRate}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <CompoundInterestResult
                mode={mode}
                currency={currency}
                hasCalculated={activeCalculated}
                futureValue={computation.forward.futureValue}
                principal={computation.forward.principal}
                totalContributions={computation.forward.totalContributions}
                totalInterest={computation.forward.totalInterest}
                resolvedRate={computation.resolvedRate}
                resolvedYears={computation.resolvedYears}
                resolvedContribution={computation.resolvedContribution}
                targetAmount={computation.targetAmount}
                unreachable={computation.unreachable}
                digitStyle={digitStyle}
                inflationRate={parseLocalizedNumber(inflationRate) || 0}
                buyingPowerAfterInflation={computation.forward.buyingPowerAfterInflation}
                frequency={frequency}
                yearlySchedule={computation.forward.yearlySchedule}
              />
              <CompoundInterestModeTabs mode={mode} onModeChange={handleModeChange} />
              <RuleOf72Card ratePercent={computation.resolvedRate} digitStyle={digitStyle} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="compound-interest-calculator"
              category="financial-calculators"
              relatedList={RELATED_TOOLS_BY_MODE[mode]}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              {/* Tablet width (md-only) full-width: the sidebar (with Related Tools) is hidden below `lg` by
                  the shared above-the-fold layout, so this tool surfaces it here specifically for that gap. */}
              <div className="hidden md:block lg:hidden">
                <RelatedToolsSidebar
                  currentSlug="compound-interest-calculator"
                  category="financial-calculators"
                  relatedList={RELATED_TOOLS_BY_MODE[mode]}
                  relatedListTitle={t("relatedTools.title")}
                />
              </div>
              <SectionNav items={navItems} visible={navBarVisible} />
              <CompoundInterestGrowthChart
                hasCalculated={activeCalculated}
                currency={currency}
                yearlySchedule={computation.forward.yearlySchedule}
                principal={computation.forward.principal}
                totalContributions={computation.forward.totalContributions}
                totalInterest={computation.forward.totalInterest}
                digitStyle={digitStyle}
              />
              <CompoundInterestYearlyBreakdownTable
                hasCalculated={activeCalculated}
                currency={currency}
                yearlySchedule={computation.forward.yearlySchedule}
                monthlySchedule={computation.forward.monthlySchedule}
                digitStyle={digitStyle}
              />
            </div>
          }
        />
      </div>

      {education}
      <PlainDisclaimer text={t("aboveFold.disclaimer")} />
    </CompoundInterestLiveInputsProvider>
  );
}
