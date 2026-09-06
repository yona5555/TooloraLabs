"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { PhCalculator as PhCalculatorTool, type PhCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PhInputPanel from "./PhInputPanel";
import PhResult from "./PhResult";
import PhQuickReference from "./PhQuickReference";
import type { PhOperation } from "./types";

const tool = new PhCalculatorTool();

const DEFAULTS = { hConcentration: "0.0000001", pH: "5.5", ohConcentration: "0.0000001", pOH: "7" };

const EMPTY_RESULT: PhCalculatorOutput = { error: null, pH: 0, pOH: 0, hConcentration: 0, ohConcentration: 0, classification: "neutral" };

type Inputs = typeof DEFAULTS;

function computeResult(operation: PhOperation, i: Inputs): PhCalculatorOutput {
  const output = tool.execute(
    {
      operation,
      hConcentration: parseLocalizedNumber(i.hConcentration) || 0,
      pH: parseLocalizedNumber(i.pH) || 0,
      ohConcentration: parseLocalizedNumber(i.ohConcentration) || 0,
      pOH: parseLocalizedNumber(i.pOH) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function PhCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ph-calculator.nav");

  const [operation, setOperation] = useState<PhOperation>("fromPH");
  const [hConcentration, setHConcentration] = useState(DEFAULTS.hConcentration);
  const [pH, setPH] = useState(DEFAULTS.pH);
  const [ohConcentration, setOhConcentration] = useState(DEFAULTS.ohConcentration);
  const [pOH, setPOH] = useState(DEFAULTS.pOH);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<PhCalculatorOutput>(() => computeResult("fromPH", DEFAULTS));
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

  function currentInputs(): Inputs {
    return { hConcentration, pH, ohConcentration, pOH };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(operation, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(hConcentration, pH, ohConcentration, pOH));
  }

  function handleOperationChange(next: PhOperation) {
    setOperation(next);
    setResult(computeResult(next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setHConcentration(DEFAULTS.hConcentration);
    setPH(DEFAULTS.pH);
    setOhConcentration(DEFAULTS.ohConcentration);
    setPOH(DEFAULTS.pOH);
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
            <PhInputPanel
              operation={operation}
              onOperationChange={handleOperationChange}
              hConcentration={hConcentration}
              onHConcentrationChange={setHConcentration}
              pH={pH}
              onPHChange={setPH}
              ohConcentration={ohConcentration}
              onOhConcentrationChange={setOhConcentration}
              pOH={pOH}
              onPOHChange={setPOH}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<PhResult hasCalculated={hasCalculated} result={result} operation={operation} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="ph-calculator" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <PhQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
