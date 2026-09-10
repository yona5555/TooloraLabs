"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MolarityCalculator as MolarityCalculatorTool, type MolarityCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import MolarityInputPanel from "./MolarityInputPanel";
import MolarityResult from "./MolarityResult";
import MolarityQuickReference from "./MolarityQuickReference";
import MolarityModeTabs from "./MolarityModeTabs";
import MolarityConcentrationCard from "./MolarityConcentrationCard";
import MolarityReferenceTable from "./MolarityReferenceTable";
import type { ConcentrationBasis, DilutionSolveFor, MolarityMode } from "./types";

const tool = new MolarityCalculatorTool();

const DEFAULTS = { moles: "0.5", massGrams: "58.44", molarMass: "58.44", volumeLiters: "2", c1: "2", v1: "0.5", c2: "1", v2: "1" };

type Inputs = typeof DEFAULTS;

// Real, mode-specific scenarios. Concentration scenarios are expressed on
// the moles basis; dilution scenarios always solve for c2 (the diluted
// concentration), leaving c1/v1/v2 as the known values.
const CONCENTRATION_SCENARIOS: Record<string, Partial<Inputs>> = {
  salineIV: { moles: "0.15", volumeLiters: "1" },
  sugarWater: { moles: "0.5", volumeLiters: "2" },
  labStockSolution: { moles: "2", volumeLiters: "0.5" },
};

const DILUTION_SCENARIOS: Record<string, Partial<Inputs>> = {
  diluteStockTenfold: { c1: "10", v1: "0.1", v2: "1" },
  labSerialDilution: { c1: "1", v1: "0.01", v2: "1" },
  diluteConcentratedAcid: { c1: "12", v1: "0.05", v2: "1" },
};

const SCENARIOS_BY_MODE: Record<MolarityMode, Record<string, Partial<Inputs>>> = {
  concentration: CONCENTRATION_SCENARIOS,
  dilution: DILUTION_SCENARIOS,
};

const EMPTY_RESULT: MolarityCalculatorOutput = { error: null, moles: 0, molarity: 0, c1: 0, v1: 0, c2: 0, v2: 0 };

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

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS_BY_MODE[mode][key];
    if (!preset) return;
    const next = { ...currentInputs(), ...preset };
    if (preset.moles !== undefined) setMoles(preset.moles);
    if (preset.massGrams !== undefined) setMassGrams(preset.massGrams);
    if (preset.molarMass !== undefined) setMolarMass(preset.molarMass);
    if (preset.volumeLiters !== undefined) setVolumeLiters(preset.volumeLiters);
    if (preset.c1 !== undefined) setC1(preset.c1);
    if (preset.v1 !== undefined) setV1(preset.v1);
    if (preset.c2 !== undefined) setC2(preset.c2);
    if (preset.v2 !== undefined) setV2(preset.v2);
    const nextBasis = mode === "concentration" ? "moles" : concentrationBasis;
    const nextSolveFor = mode === "dilution" ? "c2" : dilutionSolveFor;
    setConcentrationBasis(nextBasis);
    setDilutionSolveFor(nextSolveFor);
    setResult(computeResult(mode, nextBasis, nextSolveFor, next));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(...Object.values(next)));
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
            <div className="flex flex-col gap-3">
              <MolarityInputPanel
                mode={mode}
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
                scenarioKeys={Object.keys(SCENARIOS_BY_MODE[mode])}
                onScenarioPreset={handleScenarioPreset}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              <MolarityReferenceTable />
            </div>
          }
          result={
            <div className="flex flex-col gap-3">
              <MolarityResult hasCalculated={hasCalculated} result={result} mode={mode} digitStyle={digitStyle} />
              <MolarityModeTabs mode={mode} onModeChange={handleModeChange} />
              <MolarityConcentrationCard mode={mode} molarity={result.molarity} c1={result.c1} c2={result.c2} digitStyle={digitStyle} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="molarity-calculator" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="molarity-calculator" />
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
