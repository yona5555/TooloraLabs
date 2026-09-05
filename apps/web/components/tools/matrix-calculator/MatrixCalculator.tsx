"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MatrixCalculator as MatrixCalculatorTool, type MatrixCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MatrixInputPanel from "./MatrixInputPanel";
import MatrixResult from "./MatrixResult";
import MatrixQuickReference from "./MatrixQuickReference";

const tool = new MatrixCalculatorTool();

const DEFAULTS = { a11: "4", a12: "7", a21: "2", a22: "6", b11: "1", b12: "0", b21: "0", b22: "1" };
const RELATED_TOOLS = ["vector-calculator", "scientific-calculator", "step-by-step-math-solver"];

type MatrixDraft = typeof DEFAULTS;

function computeMatrix(draft: MatrixDraft): MatrixCalculatorOutput {
  const output = tool.execute(
    {
      a11: parseLocalizedNumber(draft.a11) || 0,
      a12: parseLocalizedNumber(draft.a12) || 0,
      a21: parseLocalizedNumber(draft.a21) || 0,
      a22: parseLocalizedNumber(draft.a22) || 0,
      b11: parseLocalizedNumber(draft.b11) || 0,
      b12: parseLocalizedNumber(draft.b12) || 0,
      b21: parseLocalizedNumber(draft.b21) || 0,
      b22: parseLocalizedNumber(draft.b22) || 0,
    },
    { locale: "en-US" }
  );
  return output.data;
}

export default function MatrixCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.matrix-calculator.nav");
  const t = useTranslations("tools.matrix-calculator");
  const [draft, setDraft] = useState<MatrixDraft>(DEFAULTS);
  const [result, setResult] = useState<MatrixCalculatorOutput>(() => computeMatrix(DEFAULTS));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committed, setCommitted] = useState<MatrixDraft>(DEFAULTS);

  const digitStyle: DigitStyle = resolveDigitStyle(
    committed.a11,
    committed.a12,
    committed.a21,
    committed.a22,
    committed.b11,
    committed.b12,
    committed.b21,
    committed.b22
  );

  function patch(partial: Partial<MatrixDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeMatrix(draft));
    setCommitted(draft);
    setHasCalculated(true);
  }

  function handleClear() {
    setDraft(DEFAULTS);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const committedValues = {
    a11: parseLocalizedNumber(committed.a11) || 0,
    a12: parseLocalizedNumber(committed.a12) || 0,
    a21: parseLocalizedNumber(committed.a21) || 0,
    a22: parseLocalizedNumber(committed.a22) || 0,
    b11: parseLocalizedNumber(committed.b11) || 0,
    b12: parseLocalizedNumber(committed.b12) || 0,
    b21: parseLocalizedNumber(committed.b21) || 0,
    b22: parseLocalizedNumber(committed.b22) || 0,
  };

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
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
          }
          result={<MatrixResult result={result} digitStyle={digitStyle} matrices={committedValues} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="matrix-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MatrixQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
