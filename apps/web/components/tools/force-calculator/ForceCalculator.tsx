"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ForceCalculator as ForceCalculatorTool, type ForceCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ForceInputPanel from "./ForceInputPanel";
import ForceResult from "./ForceResult";
import ForceQuickReference from "./ForceQuickReference";
import type { ForceMode, GravitationSolveFor, SecondLawSolveFor } from "./types";

const tool = new ForceCalculatorTool();

const RELATED_TOOLS = ["kinematics-calculator", "energy-work-power-calculator", "projectile-motion-calculator", "ohms-law-calculator"];

const DEFAULTS = { force: "10", mass: "2", acceleration: "5", mass1: "5.972e24", mass2: "1", distance: "6.371e6" };

const EMPTY_RESULT: ForceCalculatorOutput = { error: null, force: 0, mass: 0, acceleration: 0, mass1: 0, mass2: 0, distance: 0 };

type Inputs = typeof DEFAULTS;

function computeResult(mode: ForceMode, secondLawSolveFor: SecondLawSolveFor, gravitationSolveFor: GravitationSolveFor, i: Inputs): ForceCalculatorOutput {
  const output = tool.execute(
    {
      mode,
      secondLawSolveFor,
      gravitationSolveFor,
      force: parseLocalizedNumber(i.force) || 0,
      mass: parseLocalizedNumber(i.mass) || 0,
      acceleration: parseLocalizedNumber(i.acceleration) || 0,
      mass1: parseLocalizedNumber(i.mass1) || 0,
      mass2: parseLocalizedNumber(i.mass2) || 0,
      distance: parseLocalizedNumber(i.distance) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function ForceCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.force-calculator");
  const tNav = useTranslations("tools.force-calculator.nav");

  const [mode, setMode] = useState<ForceMode>("secondLaw");
  const [secondLawSolveFor, setSecondLawSolveFor] = useState<SecondLawSolveFor>("force");
  const [gravitationSolveFor, setGravitationSolveFor] = useState<GravitationSolveFor>("force");
  const [force, setForce] = useState(DEFAULTS.force);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [acceleration, setAcceleration] = useState(DEFAULTS.acceleration);
  const [mass1, setMass1] = useState(DEFAULTS.mass1);
  const [mass2, setMass2] = useState(DEFAULTS.mass2);
  const [distance, setDistance] = useState(DEFAULTS.distance);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<ForceCalculatorOutput>(() => computeResult("secondLaw", "force", "force", DEFAULTS));
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
    return { force, mass, acceleration, mass1, mass2, distance };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(mode, secondLawSolveFor, gravitationSolveFor, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(force, mass, acceleration, mass1, mass2, distance));
  }

  function handleModeChange(next: ForceMode) {
    setMode(next);
    setResult(computeResult(next, secondLawSolveFor, gravitationSolveFor, currentInputs()));
    setHasCalculated(true);
  }

  function handleSecondLawSolveForChange(next: SecondLawSolveFor) {
    setSecondLawSolveFor(next);
    setResult(computeResult(mode, next, gravitationSolveFor, currentInputs()));
    setHasCalculated(true);
  }

  function handleGravitationSolveForChange(next: GravitationSolveFor) {
    setGravitationSolveFor(next);
    setResult(computeResult(mode, secondLawSolveFor, next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setForce(DEFAULTS.force);
    setMass(DEFAULTS.mass);
    setAcceleration(DEFAULTS.acceleration);
    setMass1(DEFAULTS.mass1);
    setMass2(DEFAULTS.mass2);
    setDistance(DEFAULTS.distance);
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
            <ForceInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              secondLawSolveFor={secondLawSolveFor}
              onSecondLawSolveForChange={handleSecondLawSolveForChange}
              gravitationSolveFor={gravitationSolveFor}
              onGravitationSolveForChange={handleGravitationSolveForChange}
              force={force}
              onForceChange={setForce}
              mass={mass}
              onMassChange={setMass}
              acceleration={acceleration}
              onAccelerationChange={setAcceleration}
              mass1={mass1}
              onMass1Change={setMass1}
              mass2={mass2}
              onMass2Change={setMass2}
              distance={distance}
              onDistanceChange={setDistance}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <ForceResult
              hasCalculated={hasCalculated}
              result={result}
              mode={mode}
              secondLawSolveFor={secondLawSolveFor}
              gravitationSolveFor={gravitationSolveFor}
              digitStyle={digitStyle}
            />
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="force-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ForceQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
