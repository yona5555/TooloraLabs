"use client";
import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SpellingGrammarCalculator as SGTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import SGInputPanel from "./SGInputPanel";
import SGResult from "./SGResult";
import SGQuickReference from "./SGQuickReference";
import { EXAMPLE, firstWords, wordTotal } from "./sgMath";

const tool = new SGTool();

export default function SpellingGrammarChecker({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.spelling-grammar-checker.nav");
  const [text, setText] = useState("");
  // The full text the Results handle trims from: what the visitor typed last (null = the field itself).
  const [source, setSource] = useState<string | null>(null);
  // While the field is empty, the card checks the labelled stored example.
  const isExample = !text.trim();
  const full = source ?? (isExample ? EXAMPLE : text);
  const checked = isExample ? EXAMPLE : text;

  const result = useMemo(() => {
    const output = tool.execute({ text: checked }, { locale: "en-US" });
    return output.data;
  }, [checked]);

  function handleTextChange(value: string) {
    setText(value);
    setSource(null);
  }

  function handleClear() {
    setText("");
    setSource(null);
  }

  // The handle checks the first n words of the full text and writes them into the field.
  const setWords = useCallback(
    (n: number) => {
      const src = source ?? (text.trim() ? text : EXAMPLE);
      setSource(src);
      setText(firstWords(src, n));
    },
    [source, text],
  );

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={navSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          tight
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <SGInputPanel text={text} onTextChange={handleTextChange} onClear={handleClear} />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Results card. */}
              <div className="hidden lg:block">
                <SGQuickReference />
              </div>
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <SGResult text={checked} result={result} isExample={isExample} sourceLen={full.length} words={wordTotal(checked)} totalWords={wordTotal(full)} onWords={setWords} />
              <div className="lg:hidden">
                <SGQuickReference />
              </div>
            </div>
          }
          sidebar={<RelatedToolsSidebar fill currentSlug="spelling-grammar-checker" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="spelling-grammar-checker" />
              <SectionNav items={navItems} visible={navBarVisible} />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
