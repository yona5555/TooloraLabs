"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChemicalEquationBalancer as ChemicalEquationBalancerTool, type ChemicalEquationBalancerOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import BalancerInputPanel from "./BalancerInputPanel";
import BalancerResult from "./BalancerResult";
import BalancerQuickReference from "./BalancerQuickReference";

const tool = new ChemicalEquationBalancerTool();

const RELATED_TOOLS = ["molar-mass-calculator", "stoichiometry-calculator", "molarity-calculator"];

const DEFAULT_EQUATION = "Fe + O2 -> Fe2O3";

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

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<BalancerInputPanel equation={equation} onEquationChange={setEquation} onCalculate={handleCalculate} onClear={handleClear} />}
          result={<BalancerResult hasCalculated={hasCalculated} result={result} digitStyle={digitStyle} />}
          sidebar={
            <RelatedToolsSidebar currentSlug="chemical-equation-balancer" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <BalancerQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
