"use client";
import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import LogoInputPanel from "./LogoInputPanel";
import LogoResult from "./LogoResult";
import { TlLiveProvider } from "./TlLiveContext";

export default function TextLogoGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.text-logo-generator.nav");

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <TlLiveProvider>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={<LogoInputPanel />}
          result={<LogoResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="text-logo-generator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="text-logo-generator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </TlLiveProvider>
  );
}
