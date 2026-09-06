"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { OhmsLawCalculator as OhmsLawCalculatorTool, type OhmsLawCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import OhmsLawInputPanel from "./OhmsLawInputPanel";
import OhmsLawResult from "./OhmsLawResult";
import OhmsLawQuickReference from "./OhmsLawQuickReference";
import type { OhmsLawKnownPair } from "./types";

const tool = new OhmsLawCalculatorTool();

const RELATED_TOOLS = ["energy-work-power-calculator", "force-calculator", "density-calculator", "ideal-gas-law-calculator"];

const DEFAULTS = { voltage: "12", current: "2", resistance: "6", power: "24" };

const EMPTY_RESULT: OhmsLawCalculatorOutput = { error: null, voltage: 0, current: 0, resistance: 0, power: 0 };

function computeResult(knownPair: OhmsLawKnownPair, voltage: string, current: string, resistance: string, power: string): OhmsLawCalculatorOutput {
  const output = tool.execute(
    {
      knownPair,
      voltage: parseLocalizedNumber(voltage) || 0,
      current: parseLocalizedNumber(current) || 0,
      resistance: parseLocalizedNumber(resistance) || 0,
      power: parseLocalizedNumber(power) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function OhmsLawCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.ohms-law-calculator");
  const tNav = useTranslations("tools.ohms-law-calculator.nav");

  const [knownPair, setKnownPair] = useState<OhmsLawKnownPair>("VI");
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [resistance, setResistance] = useState(DEFAULTS.resistance);
  const [power, setPower] = useState(DEFAULTS.power);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<OhmsLawCalculatorOutput>(() =>
    computeResult("VI", DEFAULTS.voltage, DEFAULTS.current, DEFAULTS.resistance, DEFAULTS.power)
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
    setResult(computeResult(knownPair, voltage, current, resistance, power));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(voltage, current, resistance, power));
  }

  function handleKnownPairChange(next: OhmsLawKnownPair) {
    setKnownPair(next);
    setResult(computeResult(next, voltage, current, resistance, power));
    setHasCalculated(true);
  }

  function handleClear() {
    setVoltage(DEFAULTS.voltage);
    setCurrent(DEFAULTS.current);
    setResistance(DEFAULTS.resistance);
    setPower(DEFAULTS.power);
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
            <OhmsLawInputPanel
              knownPair={knownPair}
              onKnownPairChange={handleKnownPairChange}
              voltage={voltage}
              onVoltageChange={setVoltage}
              current={current}
              onCurrentChange={setCurrent}
              resistance={resistance}
              onResistanceChange={setResistance}
              power={power}
              onPowerChange={setPower}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<OhmsLawResult hasCalculated={hasCalculated} result={result} knownPair={knownPair} digitStyle={digitStyle} />}
          sidebar={
            <RelatedToolsSidebar currentSlug="ohms-law-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <OhmsLawQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
