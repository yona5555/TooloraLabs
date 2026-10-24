"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { IdealGasLawCalculator as IdealGasLawCalculatorTool, type IdealGasLawCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import GasLawInputPanel from "./GasLawInputPanel";
import GasLawResult from "./GasLawResult";
import GasLawQuickReference from "./GasLawQuickReference";
import GasLawStpCard from "./GasLawStpCard";
import GasLawReferenceTable from "./GasLawReferenceTable";
import type { GasLawSolveFor } from "./types";

const tool = new IdealGasLawCalculatorTool();

const RELATED_TOOLS = ["molarity-calculator", "density-calculator", "molar-mass-calculator", "stoichiometry-calculator"];

const DEFAULTS = { pressureAtm: "1", volumeLiters: "22.414", moles: "1", temperatureKelvin: "273.15" };

type Inputs = typeof DEFAULTS;

// Real everyday and industrial scenarios, each approximately consistent
// with PV = nRT (R = 0.0821 L*atm/(mol*K)).
const SCENARIOS: Record<string, Inputs> = {
  carTireInflated: { pressureAtm: "2.2", volumeLiters: "22", moles: "2", temperatureKelvin: "293" },
  heliumBalloon: { pressureAtm: "1", volumeLiters: "5", moles: "0.2", temperatureKelvin: "298" },
  scubaTank: { pressureAtm: "200", volumeLiters: "12", moles: "98", temperatureKelvin: "293" },
  weatherBalloonHighAltitude: { pressureAtm: "0.05", volumeLiters: "1000", moles: "2.8", temperatureKelvin: "220" },
};


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

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS[key];
    if (!preset) return;
    setPressureAtm(preset.pressureAtm);
    setVolumeLiters(preset.volumeLiters);
    setMoles(preset.moles);
    setTemperatureKelvin(preset.temperatureKelvin);
    setResult(computeResult(solveFor, preset));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(preset.pressureAtm, preset.volumeLiters, preset.moles, preset.temperatureKelvin));
  }

  // The 3D thermometer marker writes back into the calculator: the T field (solving for V if T was the unknown).
  function handleHeroTemperature(value: number) {
    const next = String(value);
    const nextSolveFor = solveFor === "temperature" ? "volume" : solveFor;
    setTemperatureKelvin(next);
    setSolveFor(nextSolveFor);
    setResult(computeResult(nextSolveFor, { ...currentInputs(), temperatureKelvin: next }));
    setHasCalculated(true);
    setDigitStyle("western");
  }

  function handleClear() {
    setPressureAtm(DEFAULTS.pressureAtm);
    setVolumeLiters(DEFAULTS.volumeLiters);
    setMoles(DEFAULTS.moles);
    setTemperatureKelvin(DEFAULTS.temperatureKelvin);
    setSolveFor("volume");
    setDigitStyle("western");
    // Instant result: Clear restores every input and the mode to the defaults and shows their result at once.
    setResult(computeResult("volume", DEFAULTS));
    setHasCalculated(true);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const sideCards = (
    <>
      <GasLawReferenceTable />
      <GasLawStpCard volumeLiters={result.volumeLiters} moles={result.moles} digitStyle={digitStyle} />
    </>
  );

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-chem-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-3">
              <GasLawInputPanel
                solveFor={solveFor}
                pressureAtm={pressureAtm}
                onPressureAtmChange={setPressureAtm}
                volumeLiters={volumeLiters}
                onVolumeLitersChange={setVolumeLiters}
                moles={moles}
                onMolesChange={setMoles}
                temperatureKelvin={temperatureKelvin}
                onTemperatureKelvinChange={setTemperatureKelvin}
                scenarioKeys={Object.keys(SCENARIOS)}
                onScenarioPreset={handleScenarioPreset}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Result card. */}
              <div className="hidden flex-col gap-3 lg:flex">{sideCards}</div>
            </div>
          }
          result={
            <div className="flex flex-col gap-3 lg:h-full">
              <GasLawResult
                hasCalculated={hasCalculated}
                result={result}
                solveFor={solveFor}
                digitStyle={digitStyle}
                onSetTemperature={handleHeroTemperature}
                onSolveForChange={handleSolveForChange}
              />
              <div className="flex flex-col gap-3 lg:hidden">{sideCards}</div>
            </div>
          }
          sidebar={
            <RelatedToolsSidebar fill currentSlug="ideal-gas-law-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="ideal-gas-law-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <GasLawQuickReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
