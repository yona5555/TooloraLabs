"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MolarMassCalculator as MolarMassCalculatorTool, type MolarMassCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import MolarMassInputPanel from "./MolarMassInputPanel";
import MolarMassResult from "./MolarMassResult";
import MolarMassQuickReference from "./MolarMassQuickReference";
import MolarMassGramCard from "./MolarMassGramCard";
import MolarMassReferenceTable from "./MolarMassReferenceTable";

const tool = new MolarMassCalculatorTool();

const RELATED_TOOLS = ["stoichiometry-calculator", "chemical-equation-balancer", "molarity-calculator"];

const DEFAULT_FORMULA = "C6H12O6";

// Real, familiar molecules users commonly look up.
const SCENARIOS: Record<string, string> = {
  water: "H2O",
  tableSalt: "NaCl",
  aspirin: "C9H8O4",
  caffeine: "C8H10N4O2",
  sulfuricAcid: "H2SO4",
};


function computeResult(formula: string): MolarMassCalculatorOutput {
  return tool.execute({ formula }, { locale: "en-US" }).data;
}

export default function MolarMassCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.molar-mass-calculator");
  const tNav = useTranslations("tools.molar-mass-calculator.nav");

  const [formula, setFormula] = useState(DEFAULT_FORMULA);
  const [digitStyle, setDigitStyle] = useState(() => resolveDigitStyle(DEFAULT_FORMULA));
  const [result, setResult] = useState<MolarMassCalculatorOutput>(() => computeResult(DEFAULT_FORMULA));
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
    setResult(computeResult(formula));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(formula));
  }

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS[key];
    if (!preset) return;
    setFormula(preset);
    setDigitStyle(resolveDigitStyle(preset));
    setResult(computeResult(preset));
    setHasCalculated(true);
  }

  // The Result card's rail writes a preset formula back into the calculator.
  function handleSetFormula(next: string) {
    setFormula(next);
    setDigitStyle(resolveDigitStyle(next));
    setResult(computeResult(next));
    setHasCalculated(true);
  }

  function handleClear() {
    setFormula(DEFAULT_FORMULA);
    setDigitStyle(resolveDigitStyle(DEFAULT_FORMULA));
    // Instant result: Clear restores the defaults and shows their result at once.
    setResult(computeResult(DEFAULT_FORMULA));
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const sideCards = (
    <>
      <MolarMassGramCard totalMass={result.totalMass} digitStyle={digitStyle} />
      <MolarMassReferenceTable />
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
              <MolarMassInputPanel
                formula={formula}
                onFormulaChange={setFormula}
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
              <MolarMassResult hasCalculated={hasCalculated} result={result} formula={formula} digitStyle={digitStyle} onSetFormula={handleSetFormula} />
              <div className="flex flex-col gap-3 lg:hidden">{sideCards}</div>
            </div>
          }
          sidebar={
            <RelatedToolsSidebar fill currentSlug="molar-mass-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="molar-mass-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <MolarMassQuickReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
