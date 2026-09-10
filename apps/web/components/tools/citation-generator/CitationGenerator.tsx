"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CitationGenerator as CitationGeneratorTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import CitationInputPanel from "./CitationInputPanel";
import CitationResult from "./CitationResult";
import CitationQuickReference from "./CitationQuickReference";
import { CITATION_SCENARIOS, EMPTY_CITATION_DRAFT, type CitationDraft, type CitationScenario } from "./types";

const tool = new CitationGeneratorTool();

function defaultDraft(): CitationDraft {
  return CITATION_SCENARIOS[0].draft;
}

export default function CitationGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.citation-generator.nav");
  const [draft, setDraft] = useState<CitationDraft>(defaultDraft());

  function handleScenarioPreset(scenario: CitationScenario) {
    setDraft({ ...scenario.draft, authors: scenario.draft.authors.map((a) => ({ ...a })) });
  }

  function handleClear() {
    setDraft({ ...EMPTY_CITATION_DRAFT, authors: EMPTY_CITATION_DRAFT.authors.map((a) => ({ ...a })) });
  }

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
          input={
            <CitationInputPanel
              draft={draft}
              onChange={setDraft}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<CitationResult result={result} draft={draft} />}
          sidebar={<RelatedToolsSidebar currentSlug="citation-generator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="citation-generator" />
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
