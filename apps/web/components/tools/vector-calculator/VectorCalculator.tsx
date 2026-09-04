"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { VectorCalculator as VectorCalculatorTool, type VectorCalculatorOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import VectorInputPanel from "./VectorInputPanel";
import VectorResult from "./VectorResult";
import VectorQuickReference from "./VectorQuickReference";

const tool = new VectorCalculatorTool();

const DEFAULTS = { ax: "3", ay: "4", az: "0", bx: "1", by: "2", bz: "2" };
const RELATED_TOOLS = ["matrix-calculator", "scientific-calculator", "step-by-step-math-solver"];

type VectorDraft = typeof DEFAULTS;

function computeVector(draft: VectorDraft): VectorCalculatorOutput {
  const axValue = parseLocalizedNumber(draft.ax) || 0;
  const ayValue = parseLocalizedNumber(draft.ay) || 0;
  const azValue = parseLocalizedNumber(draft.az) || 0;
  const bxValue = parseLocalizedNumber(draft.bx) || 0;
  const byValue = parseLocalizedNumber(draft.by) || 0;
  const bzValue = parseLocalizedNumber(draft.bz) || 0;
  const output = tool.execute({ ax: axValue, ay: ayValue, az: azValue, bx: bxValue, by: byValue, bz: bzValue }, { locale: "en-US" });
  return output.data;
}

export default function VectorCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.vector-calculator.nav");
  const t = useTranslations("tools.vector-calculator");
  const [draft, setDraft] = useState<VectorDraft>(DEFAULTS);
  const [result, setResult] = useState<VectorCalculatorOutput>(() => computeVector(DEFAULTS));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committed, setCommitted] = useState<VectorDraft>(DEFAULTS);

  const digitStyle: DigitStyle = resolveDigitStyle(committed.ax, committed.ay, committed.az, committed.bx, committed.by, committed.bz);

  function patch(partial: Partial<VectorDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeVector(draft));
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
    ax: parseLocalizedNumber(committed.ax) || 0,
    ay: parseLocalizedNumber(committed.ay) || 0,
    az: parseLocalizedNumber(committed.az) || 0,
    bx: parseLocalizedNumber(committed.bx) || 0,
    by: parseLocalizedNumber(committed.by) || 0,
    bz: parseLocalizedNumber(committed.bz) || 0,
  };

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
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
          }
          result={
            <VectorResult
              result={result}
              ax={committedValues.ax}
              ay={committedValues.ay}
              az={committedValues.az}
              bx={committedValues.bx}
              by={committedValues.by}
              bz={committedValues.bz}
              digitStyle={digitStyle}
              hasCalculated={hasCalculated}
            />
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="vector-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <VectorQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
