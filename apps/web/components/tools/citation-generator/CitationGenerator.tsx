"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CitationGenerator as CitationGeneratorTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CitationInputPanel, { type CitationDraft } from "./CitationInputPanel";
import CitationResult from "./CitationResult";
import CitationQuickReference from "./CitationQuickReference";

const tool = new CitationGeneratorTool();

function defaultDraft(): CitationDraft {
  return {
    sourceType: "book",
    authors: [{ firstName: "Jane", lastName: "Doe" }],
    title: "The Craft of Research",
    year: "2020",
    publisher: "University of Chicago Press",
    journalName: "",
    volume: "",
    issue: "",
    pages: "",
    siteName: "",
    url: "",
    accessDate: "",
  };
}

export default function CitationGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.citation-generator.nav");
  const [draft, setDraft] = useState<CitationDraft>(defaultDraft());

  const result = useMemo(() => {
    const output = tool.execute(
      {
        sourceType: draft.sourceType,
        authors: draft.authors,
        title: draft.title,
        year: draft.year,
        publisher: draft.publisher,
        journalName: draft.journalName,
        volume: draft.volume,
        issue: draft.issue,
        pages: draft.pages,
        siteName: draft.siteName,
        url: draft.url,
        accessDate: draft.accessDate,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [draft]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<CitationInputPanel draft={draft} onChange={setDraft} />}
          result={<CitationResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="citation-generator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <CitationQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
