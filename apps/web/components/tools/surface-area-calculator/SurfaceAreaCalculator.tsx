"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SurfaceAreaCalculator as SurfaceAreaCalculatorTool, type SurfaceAreaCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SurfaceAreaInputPanel from "./SurfaceAreaInputPanel";
import SurfaceAreaResult from "./SurfaceAreaResult";
import SurfaceAreaQuickReference from "./SurfaceAreaQuickReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { emptySolid3DDraft, type Solid3DDraft } from "./types";
import { SurfaceAreaLiveProvider } from "./SurfaceAreaLiveContext";

const tool = new SurfaceAreaCalculatorTool();

const DEFAULT_DRAFT: Solid3DDraft = { ...emptySolid3DDraft(), side: "3" };
const RELATED_TOOLS = ["volume-calculator", "area-calculator", "scientific-calculator"];

const QUICK_EXAMPLES: Array<{ id: string; detail: string; draft: Partial<Solid3DDraft> & { shape: Solid3DDraft["shape"] } }> = [
  { id: "puzzleCube", detail: "s = 5.7", draft: { shape: "cube", side: "5.7" } },
  { id: "room", detail: "5 × 4 × 3", draft: { shape: "rectangular-prism", length: "5", width: "4", height: "3" } },
  { id: "globe", detail: "r = 15", draft: { shape: "sphere", radius: "15" } },
  { id: "paintCan", detail: "r = 8.5, h = 19", draft: { shape: "cylinder", radius: "8.5", height: "19" } },
  { id: "partyHat", detail: "r = 8, h = 20", draft: { shape: "cone", radius: "8", height: "20" } },
  { id: "tent", detail: "a = 2.5, h = 1.8", draft: { shape: "square-pyramid", baseSide: "2.5", height: "1.8" } },
];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeSurfaceArea(draft: Solid3DDraft): SurfaceAreaCalculatorOutput {
  const output = tool.execute(
    {
      shape: draft.shape,
      side: toNum(draft.side),
      length: toNum(draft.length),
      width: toNum(draft.width),
      height: toNum(draft.height),
      radius: toNum(draft.radius),
      baseSide: toNum(draft.baseSide),
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function SurfaceAreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.surface-area-calculator.nav");
  const t = useTranslations("tools.surface-area-calculator");
  const [draft, setDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);
  const [result, setResult] = useState<SurfaceAreaCalculatorOutput>(() => computeSurfaceArea(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  const tLive = useTranslations("tools.surface-area-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  const [activeExample, setActiveExample] = useState<string | null>(null);

  // Live result: every valid edit updates the hero, table and 3D at once; an invalid mid-edit
  // value keeps the last valid result instead of collapsing the card (Calculate still reports it).
  function handleChange(next: Solid3DDraft) {
    setDraft(next);
    setActiveExample(null);
    const r = computeSurfaceArea(next);
    if (!r.error) {
      setResult(r);
      setCommittedDraft(next);
      setHasCalculated(true);
    }
  }

  function handlePick(id: string) {
    const ex = QUICK_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    const next = { ...emptySolid3DDraft(), ...ex.draft };
    setDraft(next);
    setResult(computeSurfaceArea(next));
    setCommittedDraft(next);
    setHasCalculated(true);
    setActiveExample(id);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeSurfaceArea(draft));
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
    <SurfaceAreaLiveProvider value={{ dims: draft, setDim: (key, value) => setDraft((prev) => ({ ...prev, [key]: value })) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <SurfaceAreaInputPanel draft={draft} onChange={handleChange} onCalculate={handleCalculate} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: e.detail }))}
              />
            </div>
          }
          result={<SurfaceAreaResult result={result} digitStyle={digitStyle} draft={committedDraft} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="surface-area-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="surface-area-calculator" />
              <SurfaceAreaQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </SurfaceAreaLiveProvider>
  );
}
