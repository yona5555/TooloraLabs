"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { generateRandomNumbers, type RandomNumberGeneratorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import RandomNumberInputPanel from "./RandomNumberInputPanel";
import RandomNumberResult from "./RandomNumberResult";
import RandomNumberQuickReference from "./RandomNumberQuickReference";
import type { SortOrder } from "./types";

function toInt(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? NaN : Math.trunc(n);
}

const DEFAULTS = { min: "1", max: "100", count: "5" };
const DEFAULT_ARGS = { min: 1, max: 100, count: 5, allowDuplicates: true, sortOrder: "ascending" as SortOrder };

/**
 * generateRandomNumbers defaults to Math.random(), which would produce different numbers on
 * the server than on the client's first paint — React then flags a hydration mismatch, since
 * the SSR-ed HTML and the pre-hydration client render must be byte-identical. A fixed seed
 * keeps this fallback fully deterministic for use until the real, actually random numbers are
 * generated once — via useSyncExternalStore's subscribe callback, which fires only after
 * hydration has committed. Same pattern already used for Lorem Ipsum Generator's initial text.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const DETERMINISTIC_FALLBACK = generateRandomNumbers(DEFAULT_ARGS, seededRandom(42));

let cachedInitialRandomResult: RandomNumberGeneratorOutput | null = null;

function subscribeToInitialRandomResult(callback: () => void): () => void {
  if (cachedInitialRandomResult === null) {
    cachedInitialRandomResult = generateRandomNumbers(DEFAULT_ARGS);
    callback();
  }
  return () => {};
}

function getInitialRandomResult(): RandomNumberGeneratorOutput | null {
  return cachedInitialRandomResult;
}

function getServerInitialRandomResult(): RandomNumberGeneratorOutput | null {
  return null;
}

export default function RandomNumberGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.random-number-generator.nav");

  const [min, setMin] = useState(DEFAULTS.min);
  const [max, setMax] = useState(DEFAULTS.max);
  const [count, setCount] = useState(DEFAULTS.count);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("ascending");

  const initialRandomResult = useSyncExternalStore(
    subscribeToInitialRandomResult,
    getInitialRandomResult,
    getServerInitialRandomResult,
  );
  const [manualResult, setManualResult] = useState<RandomNumberGeneratorOutput | null>(null);
  const result = manualResult ?? initialRandomResult ?? DETERMINISTIC_FALLBACK;

  const digitStyle = resolveDigitStyle(min, max, count);

  function handleGenerate() {
    setManualResult(
      generateRandomNumbers({
        min: toInt(min),
        max: toInt(max),
        count: toInt(count),
        allowDuplicates,
        sortOrder,
      })
    );
  }

  function handleClear() {
    setMin(DEFAULTS.min);
    setMax(DEFAULTS.max);
    setCount(DEFAULTS.count);
    setAllowDuplicates(true);
    setSortOrder("ascending");
    setManualResult(generateRandomNumbers(DEFAULT_ARGS));
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
              onClear={handleClear}
            />
          }
          result={<RandomNumberResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="random-number-generator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="random-number-generator" />
              <RandomNumberQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
