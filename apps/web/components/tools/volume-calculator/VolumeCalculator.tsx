"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { VolumeCalculator as VolumeCalculatorTool, type VolumeCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import VolumeInputPanel from "./VolumeInputPanel";
import VolumeResult from "./VolumeResult";
import VolumeQuickReference from "./VolumeQuickReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { emptySolid3DDraft, type Solid3DDraft } from "./types";
import { VolumeLiveProvider } from "./VolumeLiveContext";

const tool = new VolumeCalculatorTool();

const DEFAULT_DRAFT: Solid3DDraft = { ...emptySolid3DDraft(), side: "3" };
const RELATED_TOOLS = ["surface-area-calculator", "area-calculator", "scientific-calculator"];

const QUICK_EXAMPLES: Array<{ id: string; detail: string; draft: Partial<Solid3DDraft> & { shape: Solid3DDraft["shape"] } }> = [
  { id: "die", detail: "s = 1.6", draft: { shape: "cube", side: "1.6" } },
  { id: "shippingBox", detail: "40 × 30 × 20", draft: { shape: "rectangular-prism", length: "40", width: "30", height: "20" } },
  { id: "basketball", detail: "r = 12", draft: { shape: "sphere", radius: "12" } },
  { id: "sodaCan", detail: "r = 3.3, h = 12.2", draft: { shape: "cylinder", radius: "3.3", height: "12.2" } },
  { id: "iceCreamCone", detail: "r = 2.5, h = 11", draft: { shape: "cone", radius: "2.5", height: "11" } },
  { id: "greatPyramid", detail: "a = 230, h = 146", draft: { shape: "square-pyramid", baseSide: "230", height: "146" } },
];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeVolume(draft: Solid3DDraft): VolumeCalculatorOutput {
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

export default function VolumeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.volume-calculator.nav");
  const t = useTranslations("tools.volume-calculator");
  const [draft, setDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);
  const [result, setResult] = useState<VolumeCalculatorOutput>(() => computeVolume(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  const tLive = useTranslations("tools.volume-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  const [activeExample, setActiveExample] = useState<string | null>(null);

  // Live result: every valid edit updates the hero, table and 3D at once; an invalid mid-edit
  // value keeps the last valid result instead of collapsing the card (Calculate still reports it).
  function handleChange(next: Solid3DDraft) {
    setDraft(next);
    setActiveExample(null);
    const r = computeVolume(next);
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
    setResult(computeVolume(next));
    setCommittedDraft(next);
    setHasCalculated(true);
    setActiveExample(id);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeVolume(draft));
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
    <VolumeLiveProvider value={{ dims: draft, setDim: (key, value) => setDraft((prev) => ({ ...prev, [key]: value })) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <VolumeInputPanel draft={draft} onChange={handleChange} onCalculate={handleCalculate} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: e.detail }))}
              />
            </div>
          }
          result={<VolumeResult result={result} digitStyle={digitStyle} draft={committedDraft} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="volume-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="volume-calculator" />
              <VolumeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </VolumeLiveProvider>
  );
}
