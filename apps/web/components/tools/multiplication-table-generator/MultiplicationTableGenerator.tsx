"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MultiplicationTableCalculator as MTTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MTInputPanel from "./MTInputPanel";
import MTResult from "./MTResult";
import MTQuickReference from "./MTQuickReference";
import type { MultiplicationTableMode } from "./types";

const tool = new MTTool();

export default function MultiplicationTableGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.multiplication-table-generator.nav");
  const [mode, setMode] = useState<MultiplicationTableMode>("single");
  const [number, setNumber] = useState("7");
  const [maxMultiplier, setMaxMultiplier] = useState("12");
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("10");

  const digitStyle: DigitStyle = resolveDigitStyle(number, maxMultiplier, rangeStart, rangeEnd);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        mode,
        number: parseLocalizedNumber(number),
        maxMultiplier: parseLocalizedNumber(maxMultiplier),
        rangeStart: parseLocalizedNumber(rangeStart),
        rangeEnd: parseLocalizedNumber(rangeEnd),
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [mode, number, maxMultiplier, rangeStart, rangeEnd]);

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
            <MTInputPanel
              mode={mode}
              onModeChange={setMode}
              number={number}
              onNumberChange={setNumber}
              maxMultiplier={maxMultiplier}
              onMaxMultiplierChange={setMaxMultiplier}
              rangeStart={rangeStart}
              onRangeStartChange={setRangeStart}
              rangeEnd={rangeEnd}
              onRangeEndChange={setRangeEnd}
            />
          }
          result={<MTResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="multiplication-table-generator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MTQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
