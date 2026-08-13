"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TextCounter } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import WordCounterInputPanel from "./WordCounterInputPanel";
import WordCounterResult from "./WordCounterResult";
import PlatformLimitsReference from "./PlatformLimitsReference";

const tool = new TextCounter();

export default function WordCounterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.word-counter.nav");

  const [text, setText] = useState("");

  const stats = useMemo(() => tool.execute({ text }, { locale: "en-US" }).data, [text]);
  const digitStyle = resolveDigitStyle(text);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<WordCounterInputPanel text={text} onTextChange={setText} />}
          result={<WordCounterResult stats={stats} hasText={text.trim().length > 0} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="word-counter" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PlatformLimitsReference characters={stats.characters} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
