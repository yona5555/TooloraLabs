"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { LoremIpsumCalculator as LoremTool, type LoremIpsumOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import LoremInputPanel from "./LoremInputPanel";
import LoremResult from "./LoremResult";
import LoremQuickReference from "./LoremQuickReference";
import type { LoremUnit, LoremStyle } from "./types";

const tool = new LoremTool();

export default function LoremIpsumGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.lorem-ipsum-generator.nav");
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState("3");
  const [style, setStyle] = useState<LoremStyle>("classic");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const digitStyle: DigitStyle = resolveDigitStyle(count);

  const [result, setResult] = useState<LoremIpsumOutput>(() =>
    tool.execute({ unit: "paragraphs", count: 3, style: "classic", startWithLorem: true }, { locale: "en-US" }).data,
  );

  function handleGenerate() {
    const output = tool.execute(
      { unit, count: parseLocalizedNumber(count) || 0, style, startWithLorem },
      { locale: "en-US" },
    );
    setResult(output.data);
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
            <LoremInputPanel
              unit={unit}
              onUnitChange={setUnit}
              count={count}
              onCountChange={setCount}
              style={style}
              onStyleChange={setStyle}
              startWithLorem={startWithLorem}
              onStartWithLoremChange={setStartWithLorem}
              onGenerate={handleGenerate}
            />
          }
          result={<LoremResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="lorem-ipsum-generator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <LoremQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
