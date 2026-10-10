"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import { percentageFrame } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import PercentageInputPanel from "./PercentageInputPanel";
import PercentageResult from "./PercentageResult";
import PercentageQuickReference from "./PercentageQuickReference";
import { PercentageLiveProvider, type PercentageLiveDims } from "./PercentageLiveContext";
import { PERCENTAGE_SCENARIOS, type PercentageMode } from "./types";

const DEFAULTS: Record<PercentageMode, { first: string; second: string }> = {
  "percent-of-number": { first: "20", second: "150" },
  "what-percent": { first: "45", second: "180" },
  "percentage-change": { first: "80", second: "100" },
  "reverse-percentage": { first: "30", second: "12" },
  "percentage-difference": { first: "40", second: "60" },
};

/** A pair that the active mode can actually compute (finite and no division by zero). */
function validPair(mode: PercentageMode, first: string, second: string): { a: number; b: number } | null {
  const a = parseLocalizedNumber(first);
  const b = parseLocalizedNumber(second);
  if (!Number.isFinite(a) || !Number.isFinite(b) || first.trim() === "" || second.trim() === "") return null;
  return percentageFrame(mode, a, b).valid ? { a, b } : null;
}

export default function PercentageCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.percentage-calculator.nav");
  const tScenarios = useTranslations("tools.percentage-calculator.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [mode, setMode] = useState<PercentageMode>("percent-of-number");
  const [first, setFirst] = useState(DEFAULTS["percent-of-number"].first);
  const [second, setSecond] = useState(DEFAULTS["percent-of-number"].second);
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [last, setLast] = useState<{ mode: PercentageMode; a: number; b: number }>({ mode: "percent-of-number", a: 20, b: 150 });

  // Live result: every valid edit updates the card, table, 3D grid and indicators at once; an
  // invalid mid-edit pair (empty field, division by zero) keeps the last valid one.
  const pair = useMemo(() => validPair(mode, first, second), [mode, first, second]);
  if (pair && (pair.a !== last.a || pair.b !== last.b || mode !== last.mode)) setLast({ mode, ...pair });

  function handleModeChange(next: PercentageMode) {
    if (next === mode) return;
    setMode(next);
    setFirst(DEFAULTS[next].first);
    setSecond(DEFAULTS[next].second);
    setActiveExample(null);
  }

  function handleClear() {
    setFirst(DEFAULTS[mode].first);
    setSecond(DEFAULTS[mode].second);
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = PERCENTAGE_SCENARIOS.find((s) => s.key === id);
    if (!ex) return;
    setMode(ex.mode);
    setFirst(ex.first);
    setSecond(ex.second);
    setActiveExample(id);
  }

  const setDim = useCallback(<K extends keyof PercentageLiveDims>(key: K, v: PercentageLiveDims[K]) => {
    setActiveExample(null);
    if (key === "first") setFirst(v as string);
    else if (key === "second") setSecond(v as string);
    else if (key === "mode") setMode(v as PercentageMode);
  }, []);

  // While the mode was just switched and the pair is invalid, `last` may belong to the old mode;
  // fall back to that mode's defaults so the frame always matches the visible mode.
  const shown = last.mode === mode ? last : { mode, a: parseLocalizedNumber(DEFAULTS[mode].first), b: parseLocalizedNumber(DEFAULTS[mode].second) };
  const live = useMemo(() => ({ dims: { mode, first, second, a: shown.a, b: shown.b }, setDim }), [mode, first, second, shown.a, shown.b, setDim]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <PercentageLiveProvider value={live}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <PercentageInputPanel
                mode={mode}
                onModeChange={handleModeChange}
                first={first}
                onFirstChange={(v) => {
                  setFirst(v);
                  setActiveExample(null);
                }}
                second={second}
                onSecondChange={(v) => {
                  setSecond(v);
                  setActiveExample(null);
                }}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={PERCENTAGE_SCENARIOS.map((s) => ({ id: s.key, label: tScenarios(s.key), detail: s.detail }))}
              />
            </div>
          }
          result={<PercentageResult invalid={pair === null} />}
          sidebar={<RelatedToolsSidebar currentSlug="percentage-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="percentage-calculator" />
              <PercentageQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </PercentageLiveProvider>
  );
}
