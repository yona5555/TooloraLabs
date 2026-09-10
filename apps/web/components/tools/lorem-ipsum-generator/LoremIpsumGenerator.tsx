"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { LoremIpsumCalculator as LoremTool, type LoremIpsumOutput } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import LoremInputPanel from "./LoremInputPanel";
import LoremResult from "./LoremResult";
import LoremQuickReference from "./LoremQuickReference";
import type { LoremUnit, LoremStyle } from "./types";

const tool = new LoremTool();
const DEFAULT_ARGS = { unit: "paragraphs" as LoremUnit, count: 3, style: "classic" as LoremStyle, startWithLorem: true };

/**
 * The tool's word selection defaults to Math.random(), which would produce different text on
 * the server than on the client's first paint — React then flags a hydration mismatch, since
 * the SSR-ed HTML and the pre-hydration client render must be byte-identical. A fixed seed
 * keeps this fallback fully deterministic (same output every time, on both sides) for use
 * until the real, actually random text is generated once — via useSyncExternalStore's
 * subscribe callback, which fires only after hydration has committed, same pattern already
 * used for AgeCalculator's live clock and the Countdown tool's clock.ts.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const DETERMINISTIC_FALLBACK = tool.execute({ ...DEFAULT_ARGS, randomFn: seededRandom(42) }, { locale: "en-US" }).data;

let cachedInitialRandomResult: LoremIpsumOutput | null = null;

function subscribeToInitialRandomResult(callback: () => void): () => void {
  if (cachedInitialRandomResult === null) {
    cachedInitialRandomResult = tool.execute(DEFAULT_ARGS, { locale: "en-US" }).data;
    callback();
  }
  return () => {};
}

function getInitialRandomResult(): LoremIpsumOutput | null {
  return cachedInitialRandomResult;
}

function getServerInitialRandomResult(): LoremIpsumOutput | null {
  return null;
}

export default function LoremIpsumGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.lorem-ipsum-generator.nav");
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState("3");
  const [style, setStyle] = useState<LoremStyle>("classic");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const digitStyle: DigitStyle = resolveDigitStyle(count);

  const initialRandomResult = useSyncExternalStore(
    subscribeToInitialRandomResult,
    getInitialRandomResult,
    getServerInitialRandomResult,
  );
  const [manualResult, setManualResult] = useState<LoremIpsumOutput | null>(null);
  const result = manualResult ?? initialRandomResult ?? DETERMINISTIC_FALLBACK;

  function handleGenerate() {
    const output = tool.execute(
      { unit, count: parseLocalizedNumber(count) || 0, style, startWithLorem },
      { locale: "en-US" },
    );
    setManualResult(output.data);
  }

  function handleClear() {
    setUnit(DEFAULT_ARGS.unit);
    setCount(String(DEFAULT_ARGS.count));
    setStyle(DEFAULT_ARGS.style);
    setStartWithLorem(DEFAULT_ARGS.startWithLorem);
    setManualResult(tool.execute(DEFAULT_ARGS, { locale: "en-US" }).data);
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
              onClear={handleClear}
            />
          }
          result={<LoremResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="lorem-ipsum-generator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="lorem-ipsum-generator" />
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
