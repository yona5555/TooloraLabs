"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import CitationStudioInput from "./CitationStudioInput";
import CitationStudioResult from "./CitationStudioResult";
import CitationBibliography from "./CitationBibliography";
import { CitationAnatomyCard, CitationCompletenessCard, CitationMixCard, CitationRecencyCard } from "./CitationIndicatorsA";
import { CitationAuthorsCard, CitationIdentifierCard, CitationLengthCard, CitationOrderCard } from "./CitationIndicatorsB";
import { sampleState, useSelected, useStudioState } from "./studio";

export default function CitationGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.citation-generator.nav");
  const t = useTranslations("tools.citation-generator.studio");
  const [state, setState] = useStudioState();
  const { source, index } = useSelected(state);
  const props = { state, onChange: setState, source, index };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "bibliography", label: t("nav.bibliography") },
    { id: "citation-indicators", label: t("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<CitationStudioInput state={state} onChange={setState} onReset={() => setState(sampleState())} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <CitationStudioResult {...props} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="citation-generator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="citation-generator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <div className="mt-8">
        <CitationBibliography state={state} onChange={setState} />
      </div>

      <section id="citation-indicators" className="mt-6 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <CitationAnatomyCard {...props} />
        <CitationAuthorsCard {...props} />
        <CitationCompletenessCard {...props} />
        <CitationLengthCard {...props} />
        <CitationOrderCard {...props} />
        <CitationMixCard {...props} />
        <CitationRecencyCard {...props} />
        <CitationIdentifierCard {...props} />
      </section>

      {education}
    </>
  );
}
