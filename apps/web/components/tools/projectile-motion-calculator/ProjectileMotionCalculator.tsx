"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ProjectileMotionCalculator as ProjectileMotionCalculatorTool, type ProjectileMotionCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ProjectileMotionInputPanel from "./ProjectileMotionInputPanel";
import ProjectileMotionResult from "./ProjectileMotionResult";
import ProjectileMotionQuickReference from "./ProjectileMotionQuickReference";
import { GRAVITY_PRESET_VALUES, type GravityPreset } from "./types";

const tool = new ProjectileMotionCalculatorTool();

const RELATED_TOOLS = ["kinematics-calculator", "force-calculator", "energy-work-power-calculator"];

const DEFAULTS = { speed: "20", angle: "45", height: "0", gravity: "9.8" };

const EMPTY_RESULT: ProjectileMotionCalculatorOutput = { error: null, timeOfFlight: 0, maxHeight: 0, range: 0, impactSpeed: 0, impactAngle: 0 };

type Inputs = typeof DEFAULTS;

function computeResult(i: Inputs): ProjectileMotionCalculatorOutput {
  const output = tool.execute(
    {
      speed: parseLocalizedNumber(i.speed) || 0,
      angle: parseLocalizedNumber(i.angle) || 0,
      height: parseLocalizedNumber(i.height) || 0,
      gravity: parseLocalizedNumber(i.gravity) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function ProjectileMotionCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.projectile-motion-calculator.nav");
  const t = useTranslations("tools.projectile-motion-calculator");
  const tForm = useTranslations("tools.projectile-motion-calculator.form");

  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [gravity, setGravity] = useState(DEFAULTS.gravity);
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>("earth");

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<ProjectileMotionCalculatorOutput>(() => computeResult(DEFAULTS));
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
    setResult(computeResult({ speed, angle, height, gravity }));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(speed, angle, height, gravity));
  }

  function handleGravityPresetChange(next: GravityPreset) {
    setGravityPreset(next);
    const nextGravity = next === "custom" ? gravity : String(GRAVITY_PRESET_VALUES[next]);
    setGravity(nextGravity);
    setResult(computeResult({ speed, angle, height, gravity: nextGravity }));
    setHasCalculated(true);
  }

  function handleClear() {
    setSpeed(DEFAULTS.speed);
    setAngle(DEFAULTS.angle);
    setHeight(DEFAULTS.height);
    setGravity(DEFAULTS.gravity);
    setGravityPreset("earth");
    setDigitStyle("western");
    setResult(EMPTY_RESULT);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const speedValue = parseLocalizedNumber(speed) || 0;
  const angleValue = parseLocalizedNumber(angle) || 0;
  const heightValue = parseLocalizedNumber(height) || 0;
  const gravityValue = parseLocalizedNumber(gravity) || 0;

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <ProjectileMotionInputPanel
              speed={speed}
              onSpeedChange={setSpeed}
              angle={angle}
              onAngleChange={setAngle}
              height={height}
              onHeightChange={setHeight}
              gravity={gravity}
              onGravityChange={setGravity}
              gravityPreset={gravityPreset}
              onGravityPresetChange={handleGravityPresetChange}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <ProjectileMotionResult
              hasCalculated={hasCalculated}
              result={result}
              speed={speedValue}
              angle={angleValue}
              height={heightValue}
              gravity={gravityValue}
              gravityPresetLabel={tForm(`gravityPreset.${gravityPreset}`)}
              digitStyle={digitStyle}
            />
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="projectile-motion-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ProjectileMotionQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
