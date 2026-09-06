"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { RandomQuoteCalculator as QuoteTool, type Quote } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import QuoteInputPanel from "./QuoteInputPanel";
import QuoteResult from "./QuoteResult";
import QuoteQuickReference from "./QuoteQuickReference";
import type { QuoteCategory } from "./types";

const tool = new QuoteTool();

export default function RandomQuoteGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.random-quote-generator.nav");
  const [category, setCategory] = useState<QuoteCategory | "all">("all");
  const [quote, setQuote] = useState<Quote>(
    () => tool.execute({ category: "all" }, { locale: "en-US" }).data.quote,
  );

  function handleNewQuote() {
    const output = tool.execute({ category, excludeId: quote.id }, { locale: "en-US" });
    setQuote(output.data.quote);
  }

  function handleCategoryChange(next: QuoteCategory | "all") {
    setCategory(next);
    const output = tool.execute({ category: next, excludeId: quote.id }, { locale: "en-US" });
    setQuote(output.data.quote);
  }

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
            <QuoteInputPanel category={category} onCategoryChange={handleCategoryChange} onNewQuote={handleNewQuote} />
          }
          result={<QuoteResult quote={quote} />}
          sidebar={<RelatedToolsSidebar currentSlug="random-quote-generator" category="fun-entertainment" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <QuoteQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
