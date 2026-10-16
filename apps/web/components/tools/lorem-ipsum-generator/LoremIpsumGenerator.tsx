"use client";
import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import LoremInputPanel from "./LoremInputPanel";
import LoremResult from "./LoremResult";
import { LiLiveProvider } from "./LiLiveContext";

export default function LoremIpsumGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.lorem-ipsum-generator.nav");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <LiLiveProvider>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<LoremInputPanel />}
          result={<LoremResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="lorem-ipsum-generator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="lorem-ipsum-generator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </LiLiveProvider>
  );
}
