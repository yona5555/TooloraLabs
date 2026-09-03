"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { NotepadCalculator as NotepadCalculatorTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import NotepadInputPanel from "./NotepadInputPanel";
import NotepadResult from "./NotepadResult";
import NotepadQuickReference from "./NotepadQuickReference";
import { defaultNotepadText } from "./types";

const tool = new NotepadCalculatorTool();

export default function NotepadCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.notepad-calculator.nav");
  const [text, setText] = useState(defaultNotepadText());

  const result = useMemo(() => tool.execute({ text }, { locale: "en-US" }).data, [text]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<NotepadInputPanel text={text} onChange={setText} />}
          result={<NotepadResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="notepad-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <NotepadQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
