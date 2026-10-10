"use client";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { type DigitStyle } from "@tooloralabs/core";
import { VectorCalculator as VectorCalculatorTool, type VectorCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import VectorInputPanel from "./VectorInputPanel";
import VectorResult from "./VectorResult";
import VectorQuickReference from "./VectorQuickReference";
import { VectorLiveProvider } from "./VectorLiveContext";
import { VECTOR_DEFAULTS, parseVectorDraft, type VectorDraft } from "./types";

const tool = new VectorCalculatorTool();

const RELATED_TOOLS = ["matrix-calculator", "scientific-calculator", "step-by-step-math-solver"];

const QUICK_EXAMPLES: Array<{ id: string; draft: VectorDraft }> = [
  { id: "forces", draft: { ax: "30", ay: "40", az: "0", bx: "20", by: "-10", bz: "0" } },
  { id: "work", draft: { ax: "10", ay: "10", az: "0", bx: "5", by: "0", bz: "0" } },
  { id: "torque", draft: { ax: "0.3", ay: "0", az: "0", bx: "0", by: "50", bz: "0" } },
  { id: "unitAxes", draft: { ax: "1", ay: "0", az: "0", bx: "0", by: "1", bz: "0" } },
  { id: "perpendicular", draft: { ax: "2", ay: "1", az: "0", bx: "-1", by: "2", bz: "0" } },
  { id: "parallel", draft: { ax: "1", ay: "2", az: "3", bx: "2", by: "4", bz: "6" } },
  { id: "opposite", draft: { ax: "2", ay: "-1", az: "1", bx: "-4", by: "2", bz: "-2" } },
  { id: "cubeDiagonal", draft: { ax: "1", ay: "1", az: "1", bx: "1", by: "0", bz: "0" } },
];

const detailOf = (d: VectorDraft) => `A(${d.ax}, ${d.ay}, ${d.az}) · B(${d.bx}, ${d.by}, ${d.bz})`;

function computeVector(draft: VectorDraft): VectorCalculatorOutput {
  const { a, b } = parseVectorDraft(draft);
  return tool.execute({ ax: a[0], ay: a[1], az: a[2], bx: b[0], by: b[1], bz: b[2] }, { locale: "en-US" }).data;
}

export default function VectorCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.vector-calculator.nav");
  const t = useTranslations("tools.vector-calculator");
  const tLive = useTranslations("tools.vector-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  const [draft, setDraft] = useState<VectorDraft>(VECTOR_DEFAULTS);
  // Derived from the draft: a real result is present on the very first render (including SSR).
  const result = useMemo(() => computeVector(draft), [draft]);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const digitStyle: DigitStyle = resolveDigitStyle(draft.ax, draft.ay, draft.az, draft.bx, draft.by, draft.bz);

  // Live: every edit (typing, dragging a vector tip, picking an example) updates the result,
  // its table/3D view and every indicator in the encyclopedia at once.
  function apply(next: VectorDraft, exampleId: string | null = null) {
    setDraft(next);
    setActiveExample(exampleId);
  }

  function patch(partial: Partial<VectorDraft>) {
    apply({ ...draft, ...partial });
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    apply(draft, activeExample);
  }

  function handleClear() {
    apply(VECTOR_DEFAULTS);
  }

  function handlePick(id: string) {
    const ex = QUICK_EXAMPLES.find((e) => e.id === id);
    if (ex) apply(ex.draft, id);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const { a, b } = parseVectorDraft(draft);

  return (
    <VectorLiveProvider
      value={{
        dims: draft,
        setDim: (key, value) => {
          setDraft((prev) => ({ ...prev, [key]: value }));
          setActiveExample(null);
        },
      }}
    >
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <VectorInputPanel
                ax={draft.ax}
                onAxChange={(v) => patch({ ax: v })}
                ay={draft.ay}
                onAyChange={(v) => patch({ ay: v })}
                az={draft.az}
                onAzChange={(v) => patch({ az: v })}
                bx={draft.bx}
                onBxChange={(v) => patch({ bx: v })}
                by={draft.by}
                onByChange={(v) => patch({ by: v })}
                bz={draft.bz}
                onBzChange={(v) => patch({ bz: v })}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: detailOf(e.draft) }))}
              />
            </div>
          }
          result={<VectorResult result={result} ax={a[0]} ay={a[1]} az={a[2]} bx={b[0]} by={b[1]} bz={b[2]} digitStyle={digitStyle} />}
          sidebar={
            <RelatedToolsSidebar fill
              currentSlug="vector-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="vector-calculator" />
              <VectorQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </VectorLiveProvider>
  );
}
