"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { DensityCalculator as DensityCalculatorTool, type DensityCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DensityInputPanel from "./DensityInputPanel";
import DensityResult from "./DensityResult";
import DensityQuickReference from "./DensityQuickReference";
import type { DensityOperation } from "./types";

const tool = new DensityCalculatorTool();

const DEFAULTS = { mass: "100", volume: "50", density: "2.7" };

const EMPTY_RESULT: DensityCalculatorOutput = { error: null, mass: 0, volume: 0, density: 0, densitySI: 0, specificGravity: 0 };

function computeResult(operation: DensityOperation, mass: string, volume: string, density: string): DensityCalculatorOutput {
  const output = tool.execute(
    {
      operation,
      mass: parseLocalizedNumber(mass) || 0,
      volume: parseLocalizedNumber(volume) || 0,
      density: parseLocalizedNumber(density) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function DensityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.density-calculator.nav");

  const [operation, setOperation] = useState<DensityOperation>("solveDensity");
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [density, setDensity] = useState(DEFAULTS.density);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<DensityCalculatorOutput>(() => computeResult("solveDensity", DEFAULTS.mass, DEFAULTS.volume, DEFAULTS.density));
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
    setResult(computeResult(operation, mass, volume, density));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(mass, volume, density));
  }

  function handleOperationChange(next: DensityOperation) {
    setOperation(next);
    setResult(computeResult(next, mass, volume, density));
    setHasCalculated(true);
  }

  function handleClear() {
    setMass(DEFAULTS.mass);
    setVolume(DEFAULTS.volume);
    setDensity(DEFAULTS.density);
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
            <DensityInputPanel
              operation={operation}
              onOperationChange={handleOperationChange}
              mass={mass}
              onMassChange={setMass}
              volume={volume}
              onVolumeChange={setVolume}
              density={density}
              onDensityChange={setDensity}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<DensityResult hasCalculated={hasCalculated} result={result} operation={operation} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="density-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <DensityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
