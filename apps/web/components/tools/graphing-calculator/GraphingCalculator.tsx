"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GraphingCalculator as GraphingCalculatorTool, type GraphingCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import GraphInputPanel from "./GraphInputPanel";
import GraphResult from "./GraphResult";
import GraphQuickReference from "./GraphQuickReference";
import { emptyGraphDraft, type GraphDraft } from "./types";

const tool = new GraphingCalculatorTool();

const DEFAULT_DRAFT: GraphDraft = emptyGraphDraft();
const RELATED_TOOLS = ["step-by-step-math-solver", "scientific-calculator", "matrix-calculator"];

function computeGraph(draft: GraphDraft): { result: GraphingCalculatorOutput; xMin: number; xMax: number } {
  const xMin = parseLocalizedNumber(draft.xMin);
  const xMax = parseLocalizedNumber(draft.xMax);
  const output = tool.execute({ expression: draft.expression, xMin, xMax, samples: 300 }, { locale: "en-US" });
  return { result: output.data, xMin, xMax };
}

export default function GraphingCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.graphing-calculator.nav");
  const t = useTranslations("tools.graphing-calculator");
  const [draft, setDraft] = useState<GraphDraft>(DEFAULT_DRAFT);
  const [computation, setComputation] = useState(() => computeGraph(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedExpression, setCommittedExpression] = useState(DEFAULT_DRAFT.expression);

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setComputation(computeGraph(draft));
    setCommittedExpression(draft.expression);
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
          input={<GraphInputPanel draft={draft} onChange={setDraft} onCalculate={handleCalculate} onClear={handleClear} />}
          result={
            <GraphResult
              result={computation.result}
              xMin={computation.xMin}
              xMax={computation.xMax}
              expression={committedExpression}
              hasCalculated={hasCalculated}
            />
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="graphing-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <GraphQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
