"use client";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import MatrixInputPanel from "./MatrixInputPanel";
import MatrixResult from "./MatrixResult";
import MatrixQuickReference from "./MatrixQuickReference";
import { MATRIX_DEFAULTS, MatrixLiveProvider, computeMatrix, parseMatrixDraft, type MatrixDraft } from "./MatrixLiveContext";

const RELATED_TOOLS = ["vector-calculator", "scientific-calculator", "step-by-step-math-solver"];

const m = (a: [number, number, number, number], b: [number, number, number, number]): MatrixDraft => ({
  a11: String(a[0]),
  a12: String(a[1]),
  a21: String(a[2]),
  a22: String(a[3]),
  b11: String(b[0]),
  b12: String(b[1]),
  b21: String(b[2]),
  b22: String(b[3]),
});

/** Real worked pairs that each load into the inputs with one click (column fill, visuals.md §27). */
const QUICK_EXAMPLES: Array<{ id: string; draft: MatrixDraft }> = [
  { id: "textbook", draft: m([1, 2, 3, 4], [5, 6, 7, 8]) },
  { id: "rotation", draft: m([0, -1, 1, 0], [2, 0, 0, 2]) },
  { id: "shear", draft: m([1, 1, 0, 1], [1, 0, 1, 1]) },
  { id: "reflection", draft: m([1, 0, 0, -1], [0, 1, 1, 0]) },
  { id: "scaling", draft: m([3, 0, 0, 0.5], [2, 1, 1, 1]) },
  { id: "inversePair", draft: m([2, 1, 1, 1], [1, -1, -1, 2]) },
  { id: "singular", draft: m([2, 4, 1, 2], [1, 2, 3, 4]) },
];

const detail = (d: MatrixDraft) => `A=[${d.a11},${d.a12};${d.a21},${d.a22}] B=[${d.b11},${d.b12};${d.b21},${d.b22}]`;

export default function MatrixCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.matrix-calculator.nav");
  const t = useTranslations("tools.matrix-calculator");
  const tLive = useTranslations("tools.matrix-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  // The draft is the single live source: the result, the 3D card and every indicator follow it on
  // each keystroke (and on each drag in the basis-vector lab), with the defaults giving a real result on load.
  const [draft, setDraft] = useState<MatrixDraft>(MATRIX_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const result = useMemo(() => computeMatrix(draft), [draft]);
  const digitStyle: DigitStyle = resolveDigitStyle(...Object.values(draft));
  const { A, B } = parseMatrixDraft(draft);
  const matrices = { a11: A[0], a12: A[1], a21: A[2], a22: A[3], b11: B[0], b12: B[1], b21: B[2], b22: B[3] };

  function patch(partial: Partial<MatrixDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = QUICK_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setDraft(ex.draft);
    setActiveExample(id);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  function handleClear() {
    setDraft(MATRIX_DEFAULTS);
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <MatrixLiveProvider value={{ dims: draft, setDim: (key, value) => patch({ [key]: value } as Partial<MatrixDraft>) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <MatrixInputPanel
                a11={draft.a11}
                onA11Change={(v) => patch({ a11: v })}
                a12={draft.a12}
                onA12Change={(v) => patch({ a12: v })}
                a21={draft.a21}
                onA21Change={(v) => patch({ a21: v })}
                a22={draft.a22}
                onA22Change={(v) => patch({ a22: v })}
                b11={draft.b11}
                onB11Change={(v) => patch({ b11: v })}
                b12={draft.b12}
                onB12Change={(v) => patch({ b12: v })}
                b21={draft.b21}
                onB21Change={(v) => patch({ b21: v })}
                b22={draft.b22}
                onB22Change={(v) => patch({ b22: v })}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: detail(e.draft) }))}
              />
            </div>
          }
          result={<MatrixResult result={result} digitStyle={digitStyle} matrices={matrices} />}
          sidebar={
            <RelatedToolsSidebar fill
              currentSlug="matrix-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="matrix-calculator" />
              <MatrixQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </MatrixLiveProvider>
  );
}
