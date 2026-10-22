"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import WordCounterInputPanel from "./WordCounterInputPanel";
import WordCounterResult from "./WordCounterResult";
import { WcLiveProvider } from "./WcLiveContext";

export default function WordCounterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.word-counter.nav");
  const tForm = useTranslations("tools.word-counter.form");
  const sampleText = tForm("sampleText");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <WcLiveProvider initialText={sampleText}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<WordCounterInputPanel sampleText={sampleText} />}
          result={<WordCounterResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="word-counter" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="word-counter" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </WcLiveProvider>
  );
}
