"use client";
import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import RTInputPanel from "./RTInputPanel";
import RTResult from "./RTResult";
import { RtLiveProvider } from "./RtLiveContext";

export default function ReadingTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.reading-time-calculator.nav");
  const tForm = useTranslations("tools.reading-time-calculator.form");
  const sampleText = tForm("sampleText");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <RtLiveProvider initialText={sampleText}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<RTInputPanel sampleText={sampleText} />}
          result={<RTResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="reading-time-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="reading-time-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </RtLiveProvider>
  );
}
