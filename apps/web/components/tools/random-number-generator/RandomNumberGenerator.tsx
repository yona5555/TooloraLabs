"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { generateRandomNumbers, type RandomNumberGeneratorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import RandomNumberInputPanel from "./RandomNumberInputPanel";
import RandomNumberResult from "./RandomNumberResult";
import RandomNumberQuickReference from "./RandomNumberQuickReference";
import type { SortOrder } from "./types";

function toInt(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? NaN : Math.trunc(n);
}

const DEFAULTS = { min: "1", max: "100", count: "5" };

export default function RandomNumberGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.random-number-generator.nav");

  const [min, setMin] = useState(DEFAULTS.min);
  const [max, setMax] = useState(DEFAULTS.max);
  const [count, setCount] = useState(DEFAULTS.count);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("ascending");

  const [result, setResult] = useState<RandomNumberGeneratorOutput>(() =>
    generateRandomNumbers({ min: 1, max: 100, count: 5, allowDuplicates: true, sortOrder: "ascending" })
  );

  const digitStyle = resolveDigitStyle(min, max, count);

  function handleGenerate() {
    setResult(
      generateRandomNumbers({
        min: toInt(min),
        max: toInt(max),
        count: toInt(count),
        allowDuplicates,
        sortOrder,
      })
    );
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
            <RandomNumberInputPanel
              min={min}
              onMinChange={setMin}
              max={max}
              onMaxChange={setMax}
              count={count}
              onCountChange={setCount}
              allowDuplicates={allowDuplicates}
              onAllowDuplicatesChange={setAllowDuplicates}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onGenerate={handleGenerate}
            />
          }
          result={<RandomNumberResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="random-number-generator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <RandomNumberQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
