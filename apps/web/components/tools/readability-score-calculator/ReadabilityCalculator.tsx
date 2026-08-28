"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ReadabilityScoreCalculator as ReadabilityScoreCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ReadabilityInputPanel from "./ReadabilityInputPanel";
import ReadabilityResult from "./ReadabilityResult";
import ReadabilityQuickReference from "./ReadabilityQuickReference";

const tool = new ReadabilityScoreCalculatorTool();

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. Reading is a skill that grows stronger the more you practice it. Short sentences and familiar words tend to be easier to read than long, complex ones.";

export default function ReadabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.readability-score-calculator.nav");

  const [text, setText] = useState(SAMPLE_TEXT);

  const result = useMemo(() => tool.execute({ text }, { locale: "en-US" }).data, [text]);
  const digitStyle = resolveDigitStyle(text);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<ReadabilityInputPanel text={text} onTextChange={setText} />}
          result={<ReadabilityResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="readability-score-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ReadabilityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
