"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleCalculator as CircleTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import CircleInputPanel from "./CircleInputPanel";
import CircleResult from "./CircleResult";
import CircleQuickReference from "./CircleQuickReference";
import { CircleLiveProvider, type CircleLiveDims } from "./CircleLiveContext";
import { CIRCLE_SCENARIOS, type CircleKnownField } from "./types";

const tool = new CircleTool();
const DEFAULTS = { knownField: "radius" as CircleKnownField, value: "5" };

function solveRadius(knownField: CircleKnownField, value: string): number | null {
  const v = parseLocalizedNumber(value);
  const out = tool.execute({ knownField, value: Number.isNaN(v) ? -1 : v }, { locale: "en-US" }).data;
  return out.error ? null : out.radius;
}

export default function CircleCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.circle-calculator.nav");
  const tScenarios = useTranslations("tools.circle-calculator.scenarios");
  const tCommon = useTranslations("common.live3d");
  const [knownField, setKnownField] = useState<CircleKnownField>(DEFAULTS.knownField);
  const [value, setValue] = useState(DEFAULTS.value);
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [lastRadius, setLastRadius] = useState(() => solveRadius(DEFAULTS.knownField, DEFAULTS.value) ?? 5);

  // Live result: every valid edit updates the card, table, 3D and indicators at once; an invalid
  // mid-edit value keeps the last valid circle instead of collapsing everything to zeros.
  const radius = useMemo(() => solveRadius(knownField, value), [knownField, value]);
  if (radius !== null && radius !== lastRadius) setLastRadius(radius);

  function edit(field: CircleKnownField, next: string) {
    setKnownField(field);
    setValue(next);
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = CIRCLE_SCENARIOS.find((s) => s.key === id);
    if (!ex) return;
    setKnownField(ex.knownField);
    setValue(ex.value);
    setActiveExample(id);
  }

  const setDim = useCallback(<K extends keyof CircleLiveDims>(key: K, v: CircleLiveDims[K]) => {
    setActiveExample(null);
    if (key === "knownField") setKnownField(v as CircleKnownField);
    else if (key === "value") setValue(v as string);
  }, []);

  const live = useMemo(() => ({ dims: { knownField, value, radius: radius ?? lastRadius }, setDim }), [knownField, value, radius, lastRadius, setDim]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <CircleLiveProvider value={live}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <CircleInputPanel
                knownField={knownField}
                onKnownFieldChange={(field) => edit(field, value)}
                value={value}
                onValueChange={(next) => edit(knownField, next)}
                onClear={() => edit(DEFAULTS.knownField, DEFAULTS.value)}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={CIRCLE_SCENARIOS.map((s) => ({ id: s.key, label: tScenarios(s.key), detail: s.detail }))}
              />
            </div>
          }
          result={<CircleResult invalid={radius === null} />}
          sidebar={<RelatedToolsSidebar currentSlug="circle-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="circle-calculator" />
              <CircleQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </CircleLiveProvider>
  );
}
