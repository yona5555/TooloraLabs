"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SpellingGrammarCalculator as SGTool, type SpellingGrammarOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SGInputPanel from "./SGInputPanel";
import SGResult from "./SGResult";
import SGQuickReference from "./SGQuickReference";

const tool = new SGTool();

const EMPTY_RESULT: SpellingGrammarOutput = { error: "empty-text", issues: [], wordCount: 0 };

export default function SpellingGrammarChecker({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.spelling-grammar-checker.nav");
  const [text, setText] = useState("");

  const result = useMemo(() => {
    if (!text.trim()) return EMPTY_RESULT;
    const output = tool.execute({ text }, { locale: "en-US" });
    return output.data;
  }, [text]);

  function handleClear() {
    setText("");
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
          input={<SGInputPanel text={text} onTextChange={setText} onClear={handleClear} />}
          result={<SGResult text={text} result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="spelling-grammar-checker" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <SGQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
