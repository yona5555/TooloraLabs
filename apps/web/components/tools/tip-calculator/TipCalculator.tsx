"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { TipCalculator as TipCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import TipInputPanel from "./TipInputPanel";
import TipResult from "./TipResult";
import TipInternationalNorms from "./TipInternationalNorms";
import TipPerPersonSplitDiagram from "./TipPerPersonSplitDiagram";
import TipSensitivityLineDiagram from "./TipSensitivityLineDiagram";
import type { TipResult as Result } from "./types";

const tool = new TipCalculatorTool();

const DEFAULTS = { billAmount: "64", tipPercent: "18", people: "2" };

type ComputeOutcome = { result: Result | null; errorKey: string };

function computeResult(billAmount: string, tipPercent: string, people: string, roundUpPerPerson: boolean): ComputeOutcome {
  const bill = parseLocalizedNumber(billAmount);
  const tip = parseLocalizedNumber(tipPercent);
  const peopleCount = parseLocalizedNumber(people);

  if (Number.isNaN(bill) || bill < 0 || Number.isNaN(tip) || tip < 0 || Number.isNaN(peopleCount) || peopleCount < 1) {
    return { result: null, errorKey: "required" };
  }

  const output = tool.execute({ billAmount: bill, tipPercent: tip, people: peopleCount, roundUpPerPerson }, { locale: "en-US" });
  return { result: output.data, errorKey: "" };
}

function getDefaultResult(): ComputeOutcome {
  return computeResult(DEFAULTS.billAmount, DEFAULTS.tipPercent, DEFAULTS.people, false);
}

export default function TipCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.tip-calculator");
  const tErrors = useTranslations("tools.tip-calculator.errors");
  const tNav = useTranslations("tools.tip-calculator.nav");

  const [billAmount, setBillAmount] = useState(DEFAULTS.billAmount);
  const [tipPercent, setTipPercent] = useState(DEFAULTS.tipPercent);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [roundUpPerPerson, setRoundUpPerPerson] = useState(false);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [outcome, setOutcome] = useState<ComputeOutcome>(getDefaultResult);
  const [hasCalculated, setHasCalculated] = useState(true);

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

  function performCalculate(options: { updateUrl: boolean }) {
    const next = computeResult(billAmount, tipPercent, people, roundUpPerPerson);
    setOutcome(next);
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(billAmount, tipPercent, people));

    if (options.updateUrl) {
      const params = new URLSearchParams();
      params.set("bill", billAmount);
      params.set("tip", tipPercent);
      params.set("people", people);
      params.set("roundUp", String(roundUpPerPerson));
      params.set("currency", currency);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCalculate({ updateUrl: true });
  }

  function handleClear() {
    setBillAmount(DEFAULTS.billAmount);
    setTipPercent(DEFAULTS.tipPercent);
    setPeople(DEFAULTS.people);
    setRoundUpPerPerson(false);
    setDigitStyle("western");
    setCurrency(DEFAULT_CURRENCY);
    setHasCalculated(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  // Currency is a pure unit conversion on the already-entered bill amount, not a new calculation
  // — so it takes effect immediately (converting billAmount in place and recomputing) rather than
  // waiting for an explicit Calculate press.
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convertedBill = convertAmountString(billAmount, currency, next, (raw) => parseLocalizedNumber(raw) || 0);
    setBillAmount(convertedBill);
    setCurrency(next);

    if (hasCalculated) {
      setOutcome(computeResult(convertedBill, tipPercent, people, roundUpPerPerson));
    }
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const errorMessage = outcome.errorKey ? tErrors(outcome.errorKey) : "";
  const result = outcome.result;

  const sensitivityPoints =
    result &&
    [10, 15, 18, 20, 25, 30].map((pct) => ({
      tipPercent: pct,
      totalPerPerson: (result.billAmount * (1 + pct / 100)) / Math.max(result.people, 1),
    }));

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <TipInputPanel
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              billAmount={billAmount}
              onBillAmountChange={setBillAmount}
              tipPercent={tipPercent}
              onTipPercentChange={setTipPercent}
              people={people}
              onPeopleChange={setPeople}
              roundUpPerPerson={roundUpPerPerson}
              onRoundUpPerPersonChange={setRoundUpPerPerson}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<TipResult result={result} hasCalculated={hasCalculated} errorMessage={errorMessage} digitStyle={digitStyle} currency={currency} />}
          sidebar={<RelatedToolsSidebar currentSlug="tip-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="tip-calculator" />

              {hasCalculated && result && result.people > 1 && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("splitDiagram.title")}</h3>
                  <TipPerPersonSplitDiagram
                    people={result.people}
                    amountPerPerson={result.totalPerPerson}
                    formatValue={(value) => value.toFixed(2)}
                    caption={t("splitDiagram.caption", { count: result.people })}
                  />
                </div>
              )}

              {hasCalculated && result && sensitivityPoints && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{t("sensitivityDiagram.title")}</h3>
                  <TipSensitivityLineDiagram
                    points={sensitivityPoints}
                    currentTipPercent={result.tipPercent}
                    caption={t("sensitivityDiagram.caption")}
                    xLabel={t("sensitivityDiagram.xLabel")}
                  />
                </div>
              )}

              <TipInternationalNorms />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
