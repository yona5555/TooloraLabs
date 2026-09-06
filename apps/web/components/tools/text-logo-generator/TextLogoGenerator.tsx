"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TextLogoCalculator as LogoTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import LogoInputPanel from "./LogoInputPanel";
import LogoResult from "./LogoResult";
import LogoQuickReference from "./LogoQuickReference";
import { TEXT_LOGO_STYLES } from "./types";

const tool = new LogoTool();

export default function TextLogoGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.text-logo-generator.nav");
  const [text, setText] = useState("Toolora");

  const entries = useMemo(() => {
    if (!text.trim()) return [];
    return TEXT_LOGO_STYLES.map((style) => {
      const output = tool.execute({ text, style }, { locale: "en-US" });
      return { style, text: output.data.styledText };
    });
  }, [text]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<LogoInputPanel text={text} onTextChange={setText} />}
          result={<LogoResult entries={entries} isEmpty={!text.trim()} />}
          sidebar={<RelatedToolsSidebar currentSlug="text-logo-generator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <LogoQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
