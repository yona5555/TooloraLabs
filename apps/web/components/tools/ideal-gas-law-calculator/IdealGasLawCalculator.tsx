"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { IdealGasLawCalculator as IdealGasLawCalculatorTool, type IdealGasLawCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import GasLawInputPanel from "./GasLawInputPanel";
import GasLawResult from "./GasLawResult";
import GasLawQuickReference from "./GasLawQuickReference";
import type { GasLawSolveFor } from "./types";

const tool = new IdealGasLawCalculatorTool();

const RELATED_TOOLS = ["molarity-calculator", "density-calculator", "molar-mass-calculator", "stoichiometry-calculator"];

const DEFAULTS = { pressureAtm: "1", volumeLiters: "22.414", moles: "1", temperatureKelvin: "273.15" };

const EMPTY_RESULT: IdealGasLawCalculatorOutput = { error: null, pressureAtm: 0, volumeLiters: 0, moles: 0, temperatureKelvin: 0 };

type Inputs = typeof DEFAULTS;

function computeResult(solveFor: GasLawSolveFor, i: Inputs): IdealGasLawCalculatorOutput {
  const output = tool.execute(
    {
      solveFor,
      pressureAtm: parseLocalizedNumber(i.pressureAtm) || 0,
      volumeLiters: parseLocalizedNumber(i.volumeLiters) || 0,
      moles: parseLocalizedNumber(i.moles) || 0,
      temperatureKelvin: parseLocalizedNumber(i.temperatureKelvin) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function IdealGasLawCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.ideal-gas-law-calculator");
  const tNav = useTranslations("tools.ideal-gas-law-calculator.nav");

  const [solveFor, setSolveFor] = useState<GasLawSolveFor>("volume");
  const [pressureAtm, setPressureAtm] = useState(DEFAULTS.pressureAtm);
  const [volumeLiters, setVolumeLiters] = useState(DEFAULTS.volumeLiters);
  const [moles, setMoles] = useState(DEFAULTS.moles);
  const [temperatureKelvin, setTemperatureKelvin] = useState(DEFAULTS.temperatureKelvin);

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<IdealGasLawCalculatorOutput>(() => computeResult("volume", DEFAULTS));
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
    return { pressureAtm, volumeLiters, moles, temperatureKelvin };
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(solveFor, currentInputs()));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(pressureAtm, volumeLiters, moles, temperatureKelvin));
  }

  function handleSolveForChange(next: GasLawSolveFor) {
    setSolveFor(next);
    setResult(computeResult(next, currentInputs()));
    setHasCalculated(true);
  }

  function handleClear() {
    setPressureAtm(DEFAULTS.pressureAtm);
    setVolumeLiters(DEFAULTS.volumeLiters);
    setMoles(DEFAULTS.moles);
    setTemperatureKelvin(DEFAULTS.temperatureKelvin);
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
            <GasLawInputPanel
              solveFor={solveFor}
              onSolveForChange={handleSolveForChange}
              pressureAtm={pressureAtm}
              onPressureAtmChange={setPressureAtm}
              volumeLiters={volumeLiters}
              onVolumeLitersChange={setVolumeLiters}
              moles={moles}
              onMolesChange={setMoles}
              temperatureKelvin={temperatureKelvin}
              onTemperatureKelvinChange={setTemperatureKelvin}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={<GasLawResult hasCalculated={hasCalculated} result={result} solveFor={solveFor} digitStyle={digitStyle} />}
          sidebar={
            <RelatedToolsSidebar currentSlug="ideal-gas-law-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <GasLawQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
