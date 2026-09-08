"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MolarMassCalculator as MolarMassCalculatorTool, type MolarMassCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import MolarMassInputPanel from "./MolarMassInputPanel";
import MolarMassResult from "./MolarMassResult";
import MolarMassQuickReference from "./MolarMassQuickReference";
import MolarMassGramCard from "./MolarMassGramCard";
import MolarMassReferenceTable from "./MolarMassReferenceTable";

const tool = new MolarMassCalculatorTool();

const RELATED_TOOLS = ["stoichiometry-calculator", "chemical-equation-balancer", "molarity-calculator"];

const DEFAULT_FORMULA = "C6H12O6";

const EMPTY_RESULT: MolarMassCalculatorOutput = { error: null, errorDetail: null, totalMass: 0, breakdown: [] };

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

  function handleClear() {
    setFormula(DEFAULT_FORMULA);
    setDigitStyle(resolveDigitStyle(DEFAULT_FORMULA));
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
              <MolarMassInputPanel formula={formula} onFormulaChange={setFormula} onCalculate={handleCalculate} onClear={handleClear} />
              <MolarMassReferenceTable />
            </div>
          }
          result={
            <div className="flex flex-col gap-3">
              <MolarMassResult hasCalculated={hasCalculated} result={result} formula={formula} digitStyle={digitStyle} />
              <MolarMassGramCard totalMass={result.totalMass} digitStyle={digitStyle} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="molar-mass-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
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
    </>
  );
}
