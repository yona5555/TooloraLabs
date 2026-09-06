"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MolarityCalculator as MolarityCalculatorTool, type MolarityCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MolarityInputPanel from "./MolarityInputPanel";
import MolarityResult from "./MolarityResult";
import MolarityQuickReference from "./MolarityQuickReference";
import type { ConcentrationBasis, DilutionSolveFor, MolarityMode } from "./types";

const tool = new MolarityCalculatorTool();

const DEFAULTS = { moles: "0.5", massGrams: "58.44", molarMass: "58.44", volumeLiters: "2", c1: "2", v1: "0.5", c2: "1", v2: "1" };

const EMPTY_RESULT: MolarityCalculatorOutput = { error: null, moles: 0, molarity: 0, c1: 0, v1: 0, c2: 0, v2: 0 };

type Inputs = typeof DEFAULTS;

function computeResult(mode: MolarityMode, concentrationBasis: ConcentrationBasis, dilutionSolveFor: DilutionSolveFor, i: Inputs): MolarityCalculatorOutput {
  const output = tool.execute(
    {
      mode,
      concentrationBasis,
      moles: parseLocalizedNumber(i.moles) || 0,
      massGrams: parseLocalizedNumber(i.massGrams) || 0,
      molarMass: parseLocalizedNumber(i.molarMass) || 0,
      volumeLiters: parseLocalizedNumber(i.volumeLiters) || 0,
      dilutionSolveFor,
      c1: parseLocalizedNumber(i.c1) || 0,
      v1: parseLocalizedNumber(i.v1) || 0,
      c2: parseLocalizedNumber(i.c2) || 0,
      v2: parseLocalizedNumber(i.v2) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function MolarityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.molarity-calculator.nav");

  const [mode, setMode] = useState<MolarityMode>("concentration");
  const [concentrationBasis, setConcentrationBasis] = useState<ConcentrationBasis>("moles");
  const [moles, setMoles] = useState(DEFAULTS.moles);
  const [massGrams, setMassGrams] = useState(DEFAULTS.massGrams);
  const [molarMass, setMolarMass] = useState(DEFAULTS.molarMass);
  const [volumeLiters, setVolumeLiters] = useState(DEFAULTS.volumeLiters);
  const [dilutionSolveFor, setDilutionSolveFor] = useState<DilutionSolveFor>("c2");
  const [c1, setC1] = useState(DEFAULTS.c1);
  const [v1, setV1] = useState(DEFAULTS.v1);
  const [c2, setC2] = useState(DEFAULTS.c2);
  const [v2, setV2] = useState(DEFAULTS.v2);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<MolarityCalculatorOutput>(() => computeResult("concentration", "moles", "c2", DEFAULTS));
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
    return { moles, massGrams, molarMass, volumeLiters, c1, v1, c2, v2 };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(mode, concentrationBasis, dilutionSolveFor, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(moles, massGrams, molarMass, volumeLiters, c1, v1, c2, v2));
  }

  function handleModeChange(next: MolarityMode) {
    setMode(next);
    setResult(computeResult(next, concentrationBasis, dilutionSolveFor, currentInputs()));
    setHasCalculated(true);
  }

  function handleBasisChange(next: ConcentrationBasis) {
    setConcentrationBasis(next);
    setResult(computeResult(mode, next, dilutionSolveFor, currentInputs()));
    setHasCalculated(true);
  }

  function handleDilutionSolveForChange(next: DilutionSolveFor) {
    setDilutionSolveFor(next);
    setResult(computeResult(mode, concentrationBasis, next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setMoles(DEFAULTS.moles);
    setMassGrams(DEFAULTS.massGrams);
    setMolarMass(DEFAULTS.molarMass);
    setVolumeLiters(DEFAULTS.volumeLiters);
    setC1(DEFAULTS.c1);
    setV1(DEFAULTS.v1);
    setC2(DEFAULTS.c2);
    setV2(DEFAULTS.v2);
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
            <MolarityInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              concentrationBasis={concentrationBasis}
              onConcentrationBasisChange={handleBasisChange}
              moles={moles}
              onMolesChange={setMoles}
              massGrams={massGrams}
              onMassGramsChange={setMassGrams}
              molarMass={molarMass}
              onMolarMassChange={setMolarMass}
              volumeLiters={volumeLiters}
              onVolumeLitersChange={setVolumeLiters}
              dilutionSolveFor={dilutionSolveFor}
              onDilutionSolveForChange={handleDilutionSolveForChange}
              c1={c1}
              onC1Change={setC1}
              v1={v1}
              onV1Change={setV1}
              c2={c2}
              onC2Change={setC2}
              v2={v2}
              onV2Change={setV2}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<MolarityResult hasCalculated={hasCalculated} result={result} mode={mode} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="molarity-calculator" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <MolarityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
