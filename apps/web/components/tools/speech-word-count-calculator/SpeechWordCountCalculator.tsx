"use client";
import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SWInputPanel from "./SWInputPanel";
import SWResult from "./SWResult";
import { SwLiveProvider } from "./SwLiveContext";

export default function SpeechWordCountCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.speech-word-count-calculator.nav");
  const tForm = useTranslations("tools.speech-word-count-calculator.form");
  const sampleText = tForm("sampleText");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <SwLiveProvider initialText={sampleText}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<SWInputPanel sampleText={sampleText} />}
          result={<SWResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="speech-word-count-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="speech-word-count-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </SwLiveProvider>
  );
}
