"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { StoichiometryCalculator as StoichiometryCalculatorTool, type StoichiometryCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import StoichiometryInputPanel from "./StoichiometryInputPanel";
import StoichiometryResult from "./StoichiometryResult";
import StoichiometryQuickReference from "./StoichiometryQuickReference";
import StoichiometryMillimolesCard from "./StoichiometryMillimolesCard";
import type { AmountUnit } from "./types";

const tool = new StoichiometryCalculatorTool();

const RELATED_TOOLS = ["chemical-equation-balancer", "molar-mass-calculator", "molarity-calculator"];

const DEFAULTS = { knownFormula: "H2", knownCoefficient: "2", knownAmount: "4", targetFormula: "H2O", targetCoefficient: "2" };

const EMPTY_RESULT: StoichiometryCalculatorOutput = {
  error: null,
  errorDetail: null,
  knownMolarMass: 0,
  targetMolarMass: 0,
  knownMoles: 0,
  targetMoles: 0,
  targetAmount: 0,
};

function computeResult(
  knownFormula: string,
  knownCoefficient: string,
  knownAmount: string,
  knownUnit: AmountUnit,
  targetFormula: string,
  targetCoefficient: string,
  targetUnit: AmountUnit
): StoichiometryCalculatorOutput {
  const output = tool.execute(
    {
      knownFormula,
      knownCoefficient: parseLocalizedNumber(knownCoefficient) || 0,
      knownAmount: parseLocalizedNumber(knownAmount) || 0,
      knownUnit,
      targetFormula,
      targetCoefficient: parseLocalizedNumber(targetCoefficient) || 0,
      targetUnit,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function StoichiometryCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.stoichiometry-calculator");
  const tNav = useTranslations("tools.stoichiometry-calculator.nav");

  const [knownFormula, setKnownFormula] = useState(DEFAULTS.knownFormula);
  const [knownCoefficient, setKnownCoefficient] = useState(DEFAULTS.knownCoefficient);
  const [knownAmount, setKnownAmount] = useState(DEFAULTS.knownAmount);
  const [knownUnit, setKnownUnit] = useState<AmountUnit>("grams");
  const [targetFormula, setTargetFormula] = useState(DEFAULTS.targetFormula);
  const [targetCoefficient, setTargetCoefficient] = useState(DEFAULTS.targetCoefficient);
  const [targetUnit, setTargetUnit] = useState<AmountUnit>("grams");

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<StoichiometryCalculatorOutput>(() =>
    computeResult(DEFAULTS.knownFormula, DEFAULTS.knownCoefficient, DEFAULTS.knownAmount, "grams", DEFAULTS.targetFormula, DEFAULTS.targetCoefficient, "grams")
  );
  const [hasCalculated, setHasCalculated] = useState(true);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

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

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(knownFormula, knownCoefficient, knownAmount, knownUnit, targetFormula, targetCoefficient, targetUnit));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(knownCoefficient, knownAmount, targetCoefficient));
  }

  function handleClear() {
    setKnownFormula(DEFAULTS.knownFormula);
    setKnownCoefficient(DEFAULTS.knownCoefficient);
    setKnownAmount(DEFAULTS.knownAmount);
    setKnownUnit("grams");
    setTargetFormula(DEFAULTS.targetFormula);
    setTargetCoefficient(DEFAULTS.targetCoefficient);
    setTargetUnit("grams");
    setDigitStyle("western");
    setResult(EMPTY_RESULT);
    setHasCalculated(false);
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
            <StoichiometryInputPanel
              knownFormula={knownFormula}
              onKnownFormulaChange={setKnownFormula}
              knownCoefficient={knownCoefficient}
              onKnownCoefficientChange={setKnownCoefficient}
              knownAmount={knownAmount}
              onKnownAmountChange={setKnownAmount}
              knownUnit={knownUnit}
              onKnownUnitChange={setKnownUnit}
              targetFormula={targetFormula}
              onTargetFormulaChange={setTargetFormula}
              targetCoefficient={targetCoefficient}
              onTargetCoefficientChange={setTargetCoefficient}
              targetUnit={targetUnit}
              onTargetUnitChange={setTargetUnit}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <div className="flex flex-col gap-3">
              <StoichiometryResult
                hasCalculated={hasCalculated}
                result={result}
                knownFormula={knownFormula}
                knownUnit={knownUnit}
                targetFormula={targetFormula}
                targetUnit={targetUnit}
                digitStyle={digitStyle}
              />
              <StoichiometryMillimolesCard targetMoles={result.targetMoles} digitStyle={digitStyle} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="stoichiometry-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <StoichiometryQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
