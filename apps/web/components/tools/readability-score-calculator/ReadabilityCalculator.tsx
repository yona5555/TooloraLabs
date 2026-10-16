"use client";
import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import ReadabilityInputPanel from "./ReadabilityInputPanel";
import ReadabilityResult from "./ReadabilityResult";
import { RsLiveProvider } from "./RsLiveContext";
import { SAMPLE_TEXT } from "./passageExamples";

export default function ReadabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.readability-score-calculator.nav");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <RsLiveProvider initialText={SAMPLE_TEXT}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<ReadabilityInputPanel sampleText={SAMPLE_TEXT} />}
          result={<ReadabilityResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="readability-score-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="readability-score-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </RsLiveProvider>
  );
}
