"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { StoichiometryCalculator as StoichiometryCalculatorTool, type StoichiometryCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import StoichiometryInputPanel from "./StoichiometryInputPanel";
import StoichiometryResult from "./StoichiometryResult";
import StoichiometryQuickReference from "./StoichiometryQuickReference";
import StoichiometryMillimolesCard from "./StoichiometryMillimolesCard";
import StoichiometryReferenceTable from "./StoichiometryReferenceTable";
import type { AmountUnit } from "./types";

const tool = new StoichiometryCalculatorTool();

const RELATED_TOOLS = ["chemical-equation-balancer", "molar-mass-calculator", "molarity-calculator"];

const DEFAULTS = { knownFormula: "H2", knownCoefficient: "2", knownAmount: "4", targetFormula: "H2O", targetCoefficient: "2" };

// Real reactions spanning classroom to industrial scale, each with a known
// substance's mass and both coefficients from its balanced equation.
const SCENARIOS: Record<string, { knownFormula: string; knownCoefficient: string; knownAmount: string; targetFormula: string; targetCoefficient: string }> = {
  classroomMagnesium: { knownFormula: "Mg", knownCoefficient: "2", knownAmount: "5", targetFormula: "MgO", targetCoefficient: "2" },
  labWaterSynthesis: { knownFormula: "H2", knownCoefficient: "2", knownAmount: "10", targetFormula: "H2O", targetCoefficient: "2" },
  industrialAmmonia: { knownFormula: "N2", knownCoefficient: "1", knownAmount: "5000", targetFormula: "NH3", targetCoefficient: "2" },
  bridgeIronRusting: { knownFormula: "Fe", knownCoefficient: "4", knownAmount: "5000000", targetFormula: "Fe2O3", targetCoefficient: "2" },
};

const EMPTY_RESULT: StoichiometryCalculatorOutput = {
  error: null,
  errorDetail: null,
  knownMolarMass: 0,
  targetMolarMass: 0,
  knownMoles: 0,
  targetMoles: 0,
  targetAmount: 0,
};

function computeResult(
  knownFormula: string,
  knownCoefficient: string,
  knownAmount: string,
  knownUnit: AmountUnit,
  targetFormula: string,
  targetCoefficient: string,
  targetUnit: AmountUnit
): StoichiometryCalculatorOutput {
  const output = tool.execute(
    {
      knownFormula,
      knownCoefficient: parseLocalizedNumber(knownCoefficient) || 0,
      knownAmount: parseLocalizedNumber(knownAmount) || 0,
      knownUnit,
      targetFormula,
      targetCoefficient: parseLocalizedNumber(targetCoefficient) || 0,
      targetUnit,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function StoichiometryCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.stoichiometry-calculator");
  const tNav = useTranslations("tools.stoichiometry-calculator.nav");

  const [knownFormula, setKnownFormula] = useState(DEFAULTS.knownFormula);
  const [knownCoefficient, setKnownCoefficient] = useState(DEFAULTS.knownCoefficient);
  const [knownAmount, setKnownAmount] = useState(DEFAULTS.knownAmount);
  const [knownUnit, setKnownUnit] = useState<AmountUnit>("grams");
  const [targetFormula, setTargetFormula] = useState(DEFAULTS.targetFormula);
  const [targetCoefficient, setTargetCoefficient] = useState(DEFAULTS.targetCoefficient);
  const [targetUnit, setTargetUnit] = useState<AmountUnit>("grams");

  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<StoichiometryCalculatorOutput>(() =>
    computeResult(DEFAULTS.knownFormula, DEFAULTS.knownCoefficient, DEFAULTS.knownAmount, "grams", DEFAULTS.targetFormula, DEFAULTS.targetCoefficient, "grams")
  );
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
    setResult(computeResult(knownFormula, knownCoefficient, knownAmount, knownUnit, targetFormula, targetCoefficient, targetUnit));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(knownCoefficient, knownAmount, targetCoefficient));
  }

  function handleScenarioPreset(key: string) {
    const preset = SCENARIOS[key];
    if (!preset) return;
    setKnownFormula(preset.knownFormula);
    setKnownCoefficient(preset.knownCoefficient);
    setKnownAmount(preset.knownAmount);
    setKnownUnit("grams");
    setTargetFormula(preset.targetFormula);
    setTargetCoefficient(preset.targetCoefficient);
    setTargetUnit("grams");
    setResult(computeResult(preset.knownFormula, preset.knownCoefficient, preset.knownAmount, "grams", preset.targetFormula, preset.targetCoefficient, "grams"));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(preset.knownCoefficient, preset.knownAmount, preset.targetCoefficient));
  }

  // The Result card's log-scale marker writes the known amount back into the calculator.
  function handleSetKnownAmount(value: number) {
    const next = String(value);
    setKnownAmount(next);
    setResult(computeResult(knownFormula, knownCoefficient, next, knownUnit, targetFormula, targetCoefficient, targetUnit));
    setHasCalculated(true);
    setDigitStyle("western");
  }

  function handleClear() {
    setKnownFormula(DEFAULTS.knownFormula);
    setKnownCoefficient(DEFAULTS.knownCoefficient);
    setKnownAmount(DEFAULTS.knownAmount);
    setKnownUnit("grams");
    setTargetFormula(DEFAULTS.targetFormula);
    setTargetCoefficient(DEFAULTS.targetCoefficient);
    setTargetUnit("grams");
    setDigitStyle("western");
    setResult(EMPTY_RESULT);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const millimolesCard = <StoichiometryMillimolesCard targetMoles={result.targetMoles} digitStyle={digitStyle} />;
  const constantsCard = <StoichiometryReferenceTable />;

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
              <StoichiometryInputPanel
                knownFormula={knownFormula}
                onKnownFormulaChange={setKnownFormula}
                knownCoefficient={knownCoefficient}
                onKnownCoefficientChange={setKnownCoefficient}
                knownAmount={knownAmount}
                onKnownAmountChange={setKnownAmount}
                knownUnit={knownUnit}
                onKnownUnitChange={setKnownUnit}
                targetFormula={targetFormula}
                onTargetFormulaChange={setTargetFormula}
                targetCoefficient={targetCoefficient}
                onTargetCoefficientChange={setTargetCoefficient}
                targetUnit={targetUnit}
                onTargetUnitChange={setTargetUnit}
                scenarioKeys={Object.keys(SCENARIOS)}
                onScenarioPreset={handleScenarioPreset}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              {/* Desktop: millimoles under the input card, constants under the Result card (columns end level). Phone: both after the Result card. */}
              <div className="hidden flex-col gap-3 lg:flex">{millimolesCard}</div>
            </div>
          }
          result={
            <div className="flex flex-col gap-3 lg:h-full">
              <StoichiometryResult
                hasCalculated={hasCalculated}
                result={result}
                knownFormula={knownFormula}
                knownCoefficient={parseLocalizedNumber(knownCoefficient) || 0}
                targetCoefficient={parseLocalizedNumber(targetCoefficient) || 0}
                knownUnit={knownUnit}
                targetFormula={targetFormula}
                targetUnit={targetUnit}
                digitStyle={digitStyle}
                knownAmount={parseLocalizedNumber(knownAmount) || 0}
                seedAmount={Number(DEFAULTS.knownAmount)}
                onSetKnownAmount={handleSetKnownAmount}
              />
              {/* The constants card is the column's last card: it grows (taller table rows) so the Result card keeps its own height. */}
              <div className="hidden flex-col gap-3 lg:flex lg:flex-1 lg:[&>div]:flex lg:[&>div]:flex-1 lg:[&>div]:flex-col lg:[&>div>div:last-child]:flex lg:[&>div>div:last-child]:flex-1 lg:[&>div>div:last-child]:flex-col lg:[&>div>div:last-child>div:last-child]:flex-1 lg:[&_table]:h-full">{constantsCard}</div>
              <div className="flex flex-col gap-3 lg:hidden">
                {millimolesCard}
                {constantsCard}
              </div>
            </div>
          }
          sidebar={
            <RelatedToolsSidebar fill currentSlug="stoichiometry-calculator" category="chemistry" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="stoichiometry-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <StoichiometryQuickReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
