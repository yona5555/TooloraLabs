"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { EnergyWorkPowerCalculator as EnergyWorkPowerCalculatorTool, type EnergyWorkPowerCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import EnergyInputPanel from "./EnergyInputPanel";
import EnergyResult from "./EnergyResult";
import EnergyQuickReference from "./EnergyQuickReference";
import EnergyModeTabs from "./EnergyModeTabs";
import EnergyLightbulbCard from "./EnergyLightbulbCard";
import EnergyReferenceTable from "./EnergyReferenceTable";
import type { EnergyWorkPowerMode } from "./types";

const tool = new EnergyWorkPowerCalculatorTool();

const RELATED_TOOLS = ["ohms-law-calculator", "force-calculator", "kinematics-calculator", "projectile-motion-calculator"];

const DEFAULTS = { force: "20", distance: "5", angleDegrees: "0", mass: "10", velocity: "4", height: "3", workValue: "100", time: "5" };

// Real, mode-specific everyday scenarios. Each key's fields only apply
// within the mode that owns it (values for the other three modes are left
// untouched when a preset from a different mode is later selected).
const SCENARIOS_BY_MODE: Record<EnergyWorkPowerMode, Record<string, Partial<Inputs>>> = {
  work: {
    shoppingCart: { force: "50", distance: "10", angleDegrees: "0" },
    liftBox: { force: "100", distance: "1.5", angleDegrees: "0" },
    pullSledAngle: { force: "80", distance: "5", angleDegrees: "30" },
  },
  kineticEnergy: {
    walkingHuman: { mass: "70", velocity: "1.4" },
    runningHuman: { mass: "70", velocity: "5" },
    carHighway: { mass: "1500", velocity: "30" },
  },
  potentialEnergy: {
    bookOnShelf: { mass: "1", height: "1.5" },
    diver: { mass: "70", height: "3" },
    waterBehindDam: { mass: "1000", height: "50" },
  },
  power: {
    climbingStairs: { workValue: "1000", time: "10" },
    carAccelerating: { workValue: "500000", time: "5" },
    lightbulbRunning: { workValue: "3600", time: "60" },
  },
};

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

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS_BY_MODE[mode][key];
    if (!preset) return;
    const next = { ...currentInputs(), ...preset };
    if (preset.force !== undefined) setForce(preset.force);
    if (preset.distance !== undefined) setDistance(preset.distance);
    if (preset.angleDegrees !== undefined) setAngleDegrees(preset.angleDegrees);
    if (preset.mass !== undefined) setMass(preset.mass);
    if (preset.velocity !== undefined) setVelocity(preset.velocity);
    if (preset.height !== undefined) setHeight(preset.height);
    if (preset.workValue !== undefined) setWorkValue(preset.workValue);
    if (preset.time !== undefined) setTime(preset.time);
    setResult(computeResult(mode, next));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(...Object.values(next)));
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
            <div className="flex flex-col gap-3">
              <EnergyInputPanel
                mode={mode}
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
                scenarioKeys={Object.keys(SCENARIOS_BY_MODE[mode])}
                onScenarioPreset={handleScenarioPreset}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              <EnergyReferenceTable />
            </div>
          }
          result={
            <div className="flex flex-col gap-3">
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
              <EnergyModeTabs mode={mode} onModeChange={handleModeChange} />
              <EnergyLightbulbCard
                mode={mode}
                headline={mode === "work" ? result.work : mode === "kineticEnergy" ? result.kineticEnergy : mode === "potentialEnergy" ? result.potentialEnergy : result.power}
                digitStyle={digitStyle}
              />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="energy-work-power-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="energy-work-power-calculator" />
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
