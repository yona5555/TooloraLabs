"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { EnergyWorkPowerCalculator as EnergyWorkPowerCalculatorTool, type EnergyWorkPowerCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import EnergyInputPanel from "./EnergyInputPanel";
import EnergyResult from "./EnergyResult";
import EnergyQuickReference from "./EnergyQuickReference";
import type { EnergyWorkPowerMode } from "./types";

const tool = new EnergyWorkPowerCalculatorTool();

const RELATED_TOOLS = ["ohms-law-calculator", "force-calculator", "kinematics-calculator", "projectile-motion-calculator"];

const DEFAULTS = { force: "20", distance: "5", angleDegrees: "0", mass: "10", velocity: "4", height: "3", workValue: "100", time: "5" };

const EMPTY_RESULT: EnergyWorkPowerCalculatorOutput = { error: null, work: 0, kineticEnergy: 0, potentialEnergy: 0, power: 0 };

type Inputs = typeof DEFAULTS;

function computeResult(mode: EnergyWorkPowerMode, i: Inputs): EnergyWorkPowerCalculatorOutput {
  const output = tool.execute(
    {
      mode,
      force: parseLocalizedNumber(i.force) || 0,
      distance: parseLocalizedNumber(i.distance) || 0,
      angleDegrees: parseLocalizedNumber(i.angleDegrees) || 0,
      mass: parseLocalizedNumber(i.mass) || 0,
      velocity: parseLocalizedNumber(i.velocity) || 0,
      height: parseLocalizedNumber(i.height) || 0,
      workValue: parseLocalizedNumber(i.workValue) || 0,
      time: parseLocalizedNumber(i.time) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function EnergyWorkPowerCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.energy-work-power-calculator");
  const tNav = useTranslations("tools.energy-work-power-calculator.nav");

  const [mode, setMode] = useState<EnergyWorkPowerMode>("work");
  const [force, setForce] = useState(DEFAULTS.force);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [angleDegrees, setAngleDegrees] = useState(DEFAULTS.angleDegrees);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [workValue, setWorkValue] = useState(DEFAULTS.workValue);
  const [time, setTime] = useState(DEFAULTS.time);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<EnergyWorkPowerCalculatorOutput>(() => computeResult("work", DEFAULTS));
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
    return { force, distance, angleDegrees, mass, velocity, height, workValue, time };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(mode, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(force, distance, angleDegrees, mass, velocity, height, workValue, time));
  }

  function handleModeChange(next: EnergyWorkPowerMode) {
    setMode(next);
    setResult(computeResult(next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setForce(DEFAULTS.force);
    setDistance(DEFAULTS.distance);
    setAngleDegrees(DEFAULTS.angleDegrees);
    setMass(DEFAULTS.mass);
    setVelocity(DEFAULTS.velocity);
    setHeight(DEFAULTS.height);
    setWorkValue(DEFAULTS.workValue);
    setTime(DEFAULTS.time);
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
            <EnergyInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              force={force}
              onForceChange={setForce}
              distance={distance}
              onDistanceChange={setDistance}
              angleDegrees={angleDegrees}
              onAngleDegreesChange={setAngleDegrees}
              mass={mass}
              onMassChange={setMass}
              velocity={velocity}
              onVelocityChange={setVelocity}
              height={height}
              onHeightChange={setHeight}
              workValue={workValue}
              onWorkValueChange={setWorkValue}
              time={time}
              onTimeChange={setTime}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <EnergyResult
              hasCalculated={hasCalculated}
              result={result}
              mode={mode}
              force={parseLocalizedNumber(force) || 0}
              distance={parseLocalizedNumber(distance) || 0}
              angleDegrees={parseLocalizedNumber(angleDegrees) || 0}
              mass={parseLocalizedNumber(mass) || 0}
              velocity={parseLocalizedNumber(velocity) || 0}
              height={parseLocalizedNumber(height) || 0}
              workValue={parseLocalizedNumber(workValue) || 0}
              time={parseLocalizedNumber(time) || 0}
              digitStyle={digitStyle}
            />
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="energy-work-power-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <EnergyQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
