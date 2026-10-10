"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AreaCalculator as AreaCalculatorTool, type AreaCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AreaInputPanel from "./AreaInputPanel";
import AreaResult from "./AreaResult";
import AreaQuickReference from "./AreaQuickReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { emptyAreaDraft, type AreaDraft } from "./types";
import { AreaLiveProvider } from "./AreaLiveContext";

const tool = new AreaCalculatorTool();

const DEFAULT_DRAFT: AreaDraft = { ...emptyAreaDraft(), side: "4" };
const RELATED_TOOLS = ["surface-area-calculator", "volume-calculator", "scientific-calculator"];

const QUICK_EXAMPLES: Array<{ id: string; detail: string; draft: Partial<AreaDraft> & { shape: AreaDraft["shape"] } }> = [
  { id: "floorTile", detail: "s = 0.6", draft: { shape: "square", side: "0.6" } },
  { id: "bedroom", detail: "5 × 4", draft: { shape: "rectangle", width: "5", height: "4" } },
  { id: "gardenBed", detail: "b = 8, h = 5", draft: { shape: "triangle", base: "8", height: "5" } },
  { id: "pizza", detail: "r = 18", draft: { shape: "circle", radius: "18" } },
  { id: "ovalRug", detail: "a = 1.5, b = 1", draft: { shape: "ellipse", semiMajorAxis: "1.5", semiMinorAxis: "1" } },
  { id: "plot", detail: "a = 40, b = 25, h = 18", draft: { shape: "trapezoid", base1: "40", base2: "25", height: "18" } },
  { id: "parkingSpace", detail: "b = 5, h = 2.5", draft: { shape: "parallelogram", base: "5", height: "2.5" } },
  { id: "pizzaSlice", detail: "r = 18, θ = 45°", draft: { shape: "sector", radius: "18", angleDegrees: "45" } },
];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeArea(draft: AreaDraft): AreaCalculatorOutput {
  const output = tool.execute(
    {
      shape: draft.shape,
      side: toNum(draft.side),
      width: toNum(draft.width),
      height: toNum(draft.height),
      base: toNum(draft.base),
      radius: toNum(draft.radius),
      semiMajorAxis: toNum(draft.semiMajorAxis),
      semiMinorAxis: toNum(draft.semiMinorAxis),
      base1: toNum(draft.base1),
      base2: toNum(draft.base2),
      angleDegrees: toNum(draft.angleDegrees),
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function AreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.area-calculator.nav");
  const t = useTranslations("tools.area-calculator");
  const [draft, setDraft] = useState<AreaDraft>(DEFAULT_DRAFT);
  // Computed once as a lazy useState initializer so a real result is present on the very first
  // render (including SSR) from the default dimensions — no empty-state flash on load.
  const [result, setResult] = useState<AreaCalculatorOutput>(() => computeArea(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<AreaDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  const tLive = useTranslations("tools.area-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  const [activeExample, setActiveExample] = useState<string | null>(null);

  // Live result: every valid edit updates the hero, table and 3D at once; an invalid mid-edit
  // value keeps the last valid result instead of collapsing the card (Calculate still reports it).
  function handleChange(next: AreaDraft) {
    setDraft(next);
    setActiveExample(null);
    const r = computeArea(next);
    if (!r.error) {
      setResult(r);
      setCommittedDraft(next);
      setHasCalculated(true);
    }
  }

  function handlePick(id: string) {
    const ex = QUICK_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    const next = { ...emptyAreaDraft(), ...ex.draft };
    setDraft(next);
    setResult(computeArea(next));
    setCommittedDraft(next);
    setHasCalculated(true);
    setActiveExample(id);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeArea(draft));
    setCommittedDraft(draft);
    setHasCalculated(true);
  }

  function handleClear() {
    setDraft(DEFAULT_DRAFT);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <AreaLiveProvider value={{ dims: draft, setDim: (key, value) => setDraft((prev) => ({ ...prev, [key]: value })) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <AreaInputPanel draft={draft} onChange={handleChange} onCalculate={handleCalculate} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: e.detail }))}
              />
            </div>
          }
          result={
            <AreaResult
              result={result}
              digitStyle={digitStyle}
              draft={committedDraft}
              hasCalculated={hasCalculated}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="area-calculator" category="math" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="area-calculator" />
              <AreaQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </AreaLiveProvider>
  );
}
