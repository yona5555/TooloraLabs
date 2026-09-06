"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { KinematicsCalculator as KinematicsCalculatorTool, type KinematicsCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import KinematicsInputPanel from "./KinematicsInputPanel";
import KinematicsResult from "./KinematicsResult";
import KinematicsQuickReference from "./KinematicsQuickReference";
import type { KinematicsMode, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

const tool = new KinematicsCalculatorTool();

const DEFAULTS = { v0: "0", v: "10", a: "2", t: "5", dx: "25" };

const EMPTY_RESULT: KinematicsCalculatorOutput = { error: null, v0: 0, v: 0, a: 0, t: 0, dx: 0, dxAvailable: false, tAvailable: false };

type Inputs = typeof DEFAULTS;

function computeResult(mode: KinematicsMode, solveForTime: KinematicsSolveForTime, solveForDistance: KinematicsSolveForDistance, i: Inputs): KinematicsCalculatorOutput {
  const output = tool.execute(
    {
      mode,
      solveForTime,
      solveForDistance,
      v0: parseLocalizedNumber(i.v0) || 0,
      v: parseLocalizedNumber(i.v) || 0,
      a: parseLocalizedNumber(i.a) || 0,
      t: parseLocalizedNumber(i.t) || 0,
      dx: parseLocalizedNumber(i.dx) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function KinematicsCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.kinematics-calculator.nav");

  const [mode, setMode] = useState<KinematicsMode>("timeBased");
  const [solveForTime, setSolveForTime] = useState<KinematicsSolveForTime>("v");
  const [solveForDistance, setSolveForDistance] = useState<KinematicsSolveForDistance>("v");
  const [v0, setV0] = useState(DEFAULTS.v0);
  const [v, setV] = useState(DEFAULTS.v);
  const [a, setA] = useState(DEFAULTS.a);
  const [t, setT] = useState(DEFAULTS.t);
  const [dx, setDx] = useState(DEFAULTS.dx);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<KinematicsCalculatorOutput>(() => computeResult("timeBased", "v", "v", DEFAULTS));
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
    return { v0, v, a, t, dx };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(mode, solveForTime, solveForDistance, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(v0, v, a, t, dx));
  }

  function handleModeChange(next: KinematicsMode) {
    setMode(next);
    setResult(computeResult(next, solveForTime, solveForDistance, currentInputs()));
    setHasCalculated(true);
  }

  function handleSolveForTimeChange(next: KinematicsSolveForTime) {
    setSolveForTime(next);
    setResult(computeResult(mode, next, solveForDistance, currentInputs()));
    setHasCalculated(true);
  }

  function handleSolveForDistanceChange(next: KinematicsSolveForDistance) {
    setSolveForDistance(next);
    setResult(computeResult(mode, solveForTime, next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setV0(DEFAULTS.v0);
    setV(DEFAULTS.v);
    setA(DEFAULTS.a);
    setT(DEFAULTS.t);
    setDx(DEFAULTS.dx);
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
            <KinematicsInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              solveForTime={solveForTime}
              onSolveForTimeChange={handleSolveForTimeChange}
              solveForDistance={solveForDistance}
              onSolveForDistanceChange={handleSolveForDistanceChange}
              v0={v0}
              onV0Change={setV0}
              v={v}
              onVChange={setV}
              a={a}
              onAChange={setA}
              t={t}
              onTChange={setT}
              dx={dx}
              onDxChange={setDx}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            <KinematicsResult hasCalculated={hasCalculated} result={result} mode={mode} solveForTime={solveForTime} solveForDistance={solveForDistance} digitStyle={digitStyle} />
          }
          sidebar={<RelatedToolsSidebar currentSlug="kinematics-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <KinematicsQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
