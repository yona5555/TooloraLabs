"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DuplicateLineRemover, type DuplicateLineRemoverInput } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DuplicateLineInputPanel from "./DuplicateLineInputPanel";
import DuplicateLineResult from "./DuplicateLineResult";
import DedupeReference from "./DedupeReference";

type KeepOccurrence = NonNullable<DuplicateLineRemoverInput["keepOccurrence"]>;

const tool = new DuplicateLineRemover();

export default function DuplicateLineRemoverTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.duplicate-line-remover.nav");

  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [sort, setSort] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [keepOccurrence, setKeepOccurrence] = useState<KeepOccurrence>("first");

  const digitStyle = resolveDigitStyle(text);

  const data = useMemo(() => {
    if (!text.trim()) return null;
    const output = tool.execute(
      { text, caseSensitive, sort, trimWhitespace, keepOccurrence },
      { locale: "en-US" }
    );
    return output.data;
  }, [text, caseSensitive, sort, trimWhitespace, keepOccurrence]);

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
            <DuplicateLineInputPanel
              text={text}
              onTextChange={setText}
              caseSensitive={caseSensitive}
              onCaseSensitiveChange={setCaseSensitive}
              sort={sort}
              onSortChange={setSort}
              trimWhitespace={trimWhitespace}
              onTrimWhitespaceChange={setTrimWhitespace}
              keepOccurrence={keepOccurrence}
              onKeepOccurrenceChange={setKeepOccurrence}
            />
          }
          result={<DuplicateLineResult data={data} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="duplicate-line-remover" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <DedupeReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
