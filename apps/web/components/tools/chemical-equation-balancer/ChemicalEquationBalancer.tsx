"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChemicalEquationBalancer as ChemicalEquationBalancerTool, type ChemicalEquationBalancerOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import BalancerInputPanel from "./BalancerInputPanel";
import BalancerResult from "./BalancerResult";
import BalancerQuickReference from "./BalancerQuickReference";
import BalancerCoefficientSumCard from "./BalancerCoefficientSumCard";
import BalancerReferenceTable from "./BalancerReferenceTable";
import { REACTIONS, reactionIndex } from "./chemMath";

const tool = new ChemicalEquationBalancerTool();

const RELATED_TOOLS = ["molar-mass-calculator", "stoichiometry-calculator", "molarity-calculator"];

const DEFAULT_EQUATION = "Fe + O2 -> Fe2O3";

// Real, unbalanced reactions users commonly look up.
const SCENARIOS: Record<string, string> = {
  methaneCombustion: "CH4 + O2 -> CO2 + H2O",
  ammoniaSynthesis: "N2 + H2 -> NH3",
  photosynthesis: "CO2 + H2O -> C6H12O6 + O2",
  neutralization: "NaOH + H2SO4 -> Na2SO4 + H2O",
  glucoseCombustion: "C6H12O6 + O2 -> CO2 + H2O",
};

const EMPTY_RESULT: ChemicalEquationBalancerOutput = { error: null, errorDetail: null, balancedEquation: "", terms: [] };

function computeResult(equation: string): ChemicalEquationBalancerOutput {
  return tool.execute({ equation }, { locale: "en-US" }).data;
}

export default function ChemicalEquationBalancer({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.chemical-equation-balancer");
  const tNav = useTranslations("tools.chemical-equation-balancer.nav");

  const [equation, setEquation] = useState(DEFAULT_EQUATION);
  const [digitStyle, setDigitStyle] = useState(() => resolveDigitStyle(DEFAULT_EQUATION));
  const [result, setResult] = useState<ChemicalEquationBalancerOutput>(() => computeResult(DEFAULT_EQUATION));
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
    setResult(computeResult(equation));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(equation));
  }

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS[key];
    if (!preset) return;
    setEquation(preset);
    setDigitStyle(resolveDigitStyle(preset));
    setResult(computeResult(preset));
    setHasCalculated(true);
  }

  // The Result card's reaction rail writes its reaction into the equation field and balances it.
  function handleSetReaction(i: number) {
    const next = REACTIONS[i]?.equation;
    if (!next) return;
    setEquation(next);
    setDigitStyle(resolveDigitStyle(next));
    setResult(computeResult(next));
    setHasCalculated(true);
  }

  function handleClear() {
    setEquation(DEFAULT_EQUATION);
    setDigitStyle(resolveDigitStyle(DEFAULT_EQUATION));
    setResult(EMPTY_RESULT);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const sideCards = (
    <>
      <BalancerCoefficientSumCard terms={result.terms} />
      <BalancerReferenceTable />
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
              <BalancerInputPanel
                equation={equation}
                onEquationChange={setEquation}
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
              <BalancerResult hasCalculated={hasCalculated} result={result} digitStyle={digitStyle} reactionIndex={reactionIndex(equation)} onSetReaction={handleSetReaction} />
              <div className="flex flex-col gap-3 lg:hidden">{sideCards}</div>
            </div>
          }
          sidebar={
            <RelatedToolsSidebar fill currentSlug="chemical-equation-balancer" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="chemical-equation-balancer" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <BalancerQuickReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
