"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateRetirementProjection, solveRequiredContribution, solveRequiredYears } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import RetirementModeTabs from "./RetirementModeTabs";
import RetirementInputPanel from "./RetirementInputPanel";
import RetirementResult from "./RetirementResult";
import RetirementGrowthChart from "./RetirementGrowthChart";
import RetirementYearlyBreakdownTable from "./RetirementYearlyBreakdownTable";
import type { RetirementMode, RetirementOutcome } from "./types";

/** Bounds worst-case simulation cost and rules out nonsensical multi-century horizons. */
const MAX_RETIREMENT_YEARS = 80;

const DEFAULTS = {
  currentAge: "30",
  retirementAge: "65",
  targetBalance: "1000000",
  currentSavings: "10000",
  monthlyContribution: "500",
  annualReturnRate: "7",
};

const EMPTY_OUTCOME: RetirementOutcome = {
  yearlySchedule: [],
  monthlySchedule: [],
  projectedBalance: 0,
  totalContributionsPure: 0,
  totalGrowth: 0,
  yearsToRetirement: 0,
  requiredMonthlyContribution: 0,
  retirementAgeReached: null,
  unreachable: false,
};

const QUERY_PARAM_KEYS = {
  mode: "mode",
  currentAge: "age",
  retirementAge: "retireAge",
  targetBalance: "target",
  currentSavings: "savings",
  monthlyContribution: "contribution",
  annualReturnRate: "rate",
} as const;

type Inputs = typeof DEFAULTS;

function computeOutcome(mode: RetirementMode, inputs: Inputs): RetirementOutcome {
  const currentAge = parseLocalizedNumber(inputs.currentAge) || 0;
  const retirementAgeRaw = parseLocalizedNumber(inputs.retirementAge) || 0;
  const retirementAge = Math.min(retirementAgeRaw, currentAge + MAX_RETIREMENT_YEARS);
  const currentSavings = parseLocalizedNumber(inputs.currentSavings) || 0;
  const monthlyContribution = parseLocalizedNumber(inputs.monthlyContribution) || 0;
  const annualReturnRate = parseLocalizedNumber(inputs.annualReturnRate) || 0;
  const targetBalance = parseLocalizedNumber(inputs.targetBalance) || 0;

  if (mode === "endAmount") {
    const projection = calculateRetirementProjection(currentAge, retirementAge, currentSavings, monthlyContribution, annualReturnRate);
    return {
      yearlySchedule: projection.yearlySchedule,
      monthlySchedule: projection.monthlySchedule,
      projectedBalance: projection.projectedBalance,
      totalContributionsPure: Math.max(projection.totalContributions - currentSavings, 0),
      totalGrowth: projection.totalGrowth,
      yearsToRetirement: projection.yearsToRetirement,
      requiredMonthlyContribution: 0,
      retirementAgeReached: null,
      unreachable: false,
    };
  }

  if (mode === "requiredContribution") {
    const solved = solveRequiredContribution(targetBalance, currentAge, retirementAge, currentSavings, annualReturnRate);
    const last = solved.yearlySchedule[solved.yearlySchedule.length - 1];
    return {
      yearlySchedule: solved.yearlySchedule,
      monthlySchedule: solved.monthlySchedule,
      projectedBalance: last?.balance ?? currentSavings,
      totalContributionsPure: last?.contributions ?? 0,
      totalGrowth: last?.interest ?? 0,
      yearsToRetirement: solved.yearsToRetirement,
      requiredMonthlyContribution: solved.requiredMonthlyContribution,
      retirementAgeReached: null,
      unreachable: false,
    };
  }

  const solved = solveRequiredYears(targetBalance, currentAge, currentSavings, monthlyContribution, annualReturnRate, MAX_RETIREMENT_YEARS);
  const last = solved.yearlySchedule[solved.yearlySchedule.length - 1];
  return {
    yearlySchedule: solved.yearlySchedule,
    monthlySchedule: solved.monthlySchedule,
    projectedBalance: last?.balance ?? currentSavings,
    totalContributionsPure: last?.contributions ?? 0,
    totalGrowth: last?.interest ?? 0,
    yearsToRetirement: solved.yearsNeeded ?? 0,
    requiredMonthlyContribution: 0,
    retirementAgeReached: solved.retirementAgeReached,
    unreachable: solved.yearsNeeded === null,
  };
}

export default function RetirementCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.retirement-calculator.nav");

  const [mode, setMode] = useState<RetirementMode>("endAmount");

  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [targetBalance, setTargetBalance] = useState(DEFAULTS.targetBalance);
  const [currentSavings, setCurrentSavings] = useState(DEFAULTS.currentSavings);
  const [monthlyContribution, setMonthlyContribution] = useState(DEFAULTS.monthlyContribution);
  const [annualReturnRate, setAnnualReturnRate] = useState(DEFAULTS.annualReturnRate);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  // The default active mode ("endAmount") starts pre-calculated from the default field values,
  // computed once as a lazy useState initializer so it's present on the very first render
  // (including SSR) with no empty-state flash. The other two modes stay uncalculated until first
  // visited or explicitly Calculated.
  const [outcomes, setOutcomes] = useState<Record<RetirementMode, RetirementOutcome>>(() => ({
    endAmount: computeOutcome("endAmount", DEFAULTS),
    requiredContribution: EMPTY_OUTCOME,
    requiredYears: EMPTY_OUTCOME,
  }));
  const [hasCalculated, setHasCalculated] = useState<Record<RetirementMode, boolean>>({
    endAmount: true,
    requiredContribution: false,
    requiredYears: false,
  });
  // Tracks which tabs have ever shown a result — unlike hasCalculated, Clear does NOT reset this,
  // so returning to a tab you just cleared stays empty instead of auto-recalculating again.
  const [initializedModes, setInitializedModes] = useState<Record<RetirementMode, boolean>>({
    endAmount: true,
    requiredContribution: false,
    requiredYears: false,
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

  function performCalculate(targetMode: RetirementMode, options: { updateUrl: boolean }) {
    const inputs: Inputs = { currentAge, retirementAge, targetBalance, currentSavings, monthlyContribution, annualReturnRate };
    const outcome = computeOutcome(targetMode, inputs);

    setOutcomes((prev) => ({ ...prev, [targetMode]: outcome }));
    setHasCalculated((prev) => ({ ...prev, [targetMode]: true }));
    setInitializedModes((prev) => ({ ...prev, [targetMode]: true }));
    setDigitStyle(resolveDigitStyle(currentAge, retirementAge, targetBalance, currentSavings, monthlyContribution, annualReturnRate));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set(QUERY_PARAM_KEYS.mode, targetMode);
      params.set(QUERY_PARAM_KEYS.currentAge, currentAge);
      params.set(QUERY_PARAM_KEYS.retirementAge, retirementAge);
      params.set(QUERY_PARAM_KEYS.targetBalance, targetBalance);
      params.set(QUERY_PARAM_KEYS.currentSavings, currentSavings);
      params.set(QUERY_PARAM_KEYS.monthlyContribution, monthlyContribution);
      params.set(QUERY_PARAM_KEYS.annualReturnRate, annualReturnRate);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate(mode, { updateUrl: true });
  }

  function handleModeChange(newMode: RetirementMode) {
    setMode(newMode);
    if (!initializedModes[newMode]) {
      performCalculate(newMode, { updateUrl: false });
    }
  }

  function handleClear() {
    setCurrentAge(DEFAULTS.currentAge);
    setRetirementAge(DEFAULTS.retirementAge);
    setTargetBalance(DEFAULTS.targetBalance);
    setCurrentSavings(DEFAULTS.currentSavings);
    setMonthlyContribution(DEFAULTS.monthlyContribution);
    setAnnualReturnRate(DEFAULTS.annualReturnRate);
    setDigitStyle("western");
    setHasCalculated((prev) => ({ ...prev, [mode]: false }));
    window.history.replaceState(null, "", window.location.pathname);
  }

  const activeCalculated = hasCalculated[mode];
  const outcome = outcomes[mode];

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "yearly-breakdown", label: tNav("yearlyBreakdown") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <RetirementInputPanel
              mode={mode}
              currentAge={currentAge}
              onCurrentAgeChange={setCurrentAge}
              retirementAge={retirementAge}
              onRetirementAgeChange={setRetirementAge}
              targetBalance={targetBalance}
              onTargetBalanceChange={setTargetBalance}
              currentSavings={currentSavings}
              onCurrentSavingsChange={setCurrentSavings}
              monthlyContribution={monthlyContribution}
              onMonthlyContributionChange={setMonthlyContribution}
              annualReturnRate={annualReturnRate}
              onAnnualReturnRateChange={setAnnualReturnRate}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <RetirementResult
                mode={mode}
                hasCalculated={activeCalculated}
                digitStyle={digitStyle}
                currentAge={parseLocalizedNumber(currentAge) || 0}
                retirementAge={parseLocalizedNumber(retirementAge) || 0}
                currentSavings={parseLocalizedNumber(currentSavings) || 0}
                monthlyContribution={parseLocalizedNumber(monthlyContribution) || 0}
                annualReturnRate={parseLocalizedNumber(annualReturnRate) || 0}
                targetBalance={parseLocalizedNumber(targetBalance) || 0}
                outcome={outcome}
              />
              <RetirementModeTabs mode={mode} onModeChange={handleModeChange} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="retirement-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              {/* Tablet width (md-only) full-width: the sidebar (with Related Tools) is hidden below `lg` by
                  the shared above-the-fold layout, so this tool surfaces it here specifically for that gap. */}
              <div className="hidden md:block lg:hidden">
                <RelatedToolsSidebar currentSlug="retirement-calculator" category="calculators" />
              </div>
              <SectionNav items={navItems} visible={navBarVisible} />
              <RetirementGrowthChart
                hasCalculated={activeCalculated}
                yearlySchedule={outcome.yearlySchedule}
                currentSavings={parseLocalizedNumber(currentSavings) || 0}
                totalContributions={outcome.totalContributionsPure}
                totalGrowth={outcome.totalGrowth}
                digitStyle={digitStyle}
              />
              <RetirementYearlyBreakdownTable
                hasCalculated={activeCalculated}
                yearlySchedule={outcome.yearlySchedule}
                monthlySchedule={outcome.monthlySchedule}
                digitStyle={digitStyle}
              />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
