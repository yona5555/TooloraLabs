"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GraphingCalculator as GraphingCalculatorTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import GraphInputPanel from "./GraphInputPanel";
import GraphResult from "./GraphResult";
import GraphQuickReference from "./GraphQuickReference";
import { emptyGraphDraft, type GraphDraft } from "./types";

const tool = new GraphingCalculatorTool();

export default function GraphingCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.graphing-calculator.nav");
  const [draft, setDraft] = useState<GraphDraft>(emptyGraphDraft());

  const xMin = parseLocalizedNumber(draft.xMin);
  const xMax = parseLocalizedNumber(draft.xMax);

  const result = useMemo(() => {
    const output = tool.execute({ expression: draft.expression, xMin, xMax, samples: 300 }, { locale: "en-US" });
    return output.data;
  }, [draft.expression, xMin, xMax]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<GraphInputPanel draft={draft} onChange={setDraft} />}
          result={<GraphResult result={result} xMin={xMin} xMax={xMax} />}
          sidebar={<RelatedToolsSidebar currentSlug="graphing-calculator" category="math" />}
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
