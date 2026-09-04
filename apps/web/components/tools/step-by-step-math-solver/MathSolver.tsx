"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { StepByStepMathSolver as MathSolverTool, type StepByStepMathSolverOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MathSolverInputPanel from "./MathSolverInputPanel";
import MathSolverResult from "./MathSolverResult";
import MathSolverQuickReference from "./MathSolverQuickReference";
import { emptyMathSolverDraft, type MathSolverDraft } from "./types";

const tool = new MathSolverTool();

const DEFAULT_DRAFT: MathSolverDraft = emptyMathSolverDraft();
const RELATED_TOOLS = ["scientific-calculator", "graphing-calculator", "fraction-calculator"];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeResult(draft: MathSolverDraft): StepByStepMathSolverOutput {
  const output = tool.execute(
    {
      mode: draft.mode,
      linearA: toNum(draft.linearA),
      linearB: toNum(draft.linearB),
      linearC: toNum(draft.linearC),
      linearD: toNum(draft.linearD),
      quadA: toNum(draft.quadA),
      quadB: toNum(draft.quadB),
      quadC: toNum(draft.quadC),
      fracA: toNum(draft.fracA),
      fracB: toNum(draft.fracB),
      fracOp: draft.fracOp,
      fracC: toNum(draft.fracC),
      fracD: toNum(draft.fracD),
      polynomialTerms: draft.polynomialTerms.map((term) => ({
        coefficient: toNum(term.coefficient) ?? 0,
        power: toNum(term.power) ?? 0,
      })),
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function MathSolver({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.step-by-step-math-solver.nav");
  const t = useTranslations("tools.step-by-step-math-solver");
  const [draft, setDraft] = useState<MathSolverDraft>(DEFAULT_DRAFT);
  const [result, setResult] = useState<StepByStepMathSolverOutput>(() => computeResult(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<MathSolverDraft>(DEFAULT_DRAFT);

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeResult(draft));
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
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<MathSolverInputPanel draft={draft} onChange={setDraft} onCalculate={handleCalculate} onClear={handleClear} />}
          result={<MathSolverResult result={result} draft={committedDraft} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="step-by-step-math-solver"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MathSolverQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
