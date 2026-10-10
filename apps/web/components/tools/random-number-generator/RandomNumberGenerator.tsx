"use client";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { chiSquareUniform, drawIntegers, histogram, mulberry32, sampleStats, uniformMoments } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import RandomNumberInputPanel from "./RandomNumberInputPanel";
import RandomNumberResult from "./RandomNumberResult";
import RandomNumberDrawOrder from "./RandomNumberDrawOrder";
import RandomNumberRepeatExplorer from "./RandomNumberRepeatExplorer";
import RandomNumberWorkedExamples from "./RandomNumberWorkedExamples";
import {
  AppearanceTrio,
  DistinctStacked,
  EmptyIndicator,
  EntropyZoneStrip,
  FrequencyHistogram,
  ModuloBiasCards,
  OutcomeSpaceLog,
  PresetOddsTable,
  RunningAverage,
  SpreadInRange,
  SumFormula,
  UniformityGauge,
  type Draw,
} from "./RandomNumberIndicators";
import { rngFormatters } from "./format";
import { PRESETS, type PresetKey, type SortOrder } from "./types";

const DEFAULTS = { min: "1", max: "100", count: "20", allowDuplicates: true, sortOrder: "none" as SortOrder };
/** Server render and first paint use this seed so the HTML matches; the browser then swaps in a fresh one. */
const SSR_SEED = 20261010;

function toInt(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? NaN : n;
}

function freshSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0];
}

let clientSeed: number | null = null;
const subscribeSeed = (cb: () => void) => {
  if (clientSeed === null) {
    clientSeed = freshSeed();
    cb();
  }
  return () => {};
};
const getSeed = () => clientSeed;
const getServerSeed = () => null;

export default function RandomNumberGenerator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.random-number-generator.nav");

  const [min, setMin] = useState(DEFAULTS.min);
  const [max, setMax] = useState(DEFAULTS.max);
  const [count, setCount] = useState(DEFAULTS.count);
  const [allowDuplicates, setAllowDuplicates] = useState(DEFAULTS.allowDuplicates);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULTS.sortOrder);
  const [seedInput, setSeedInput] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  const initialSeed = useSyncExternalStore(subscribeSeed, getSeed, getServerSeed);
  const seedText = seedInput ?? String(initialSeed ?? SSR_SEED);
  const seedValue = (() => {
    const v = parseLocalizedNumber(seedText);
    return Number.isFinite(v) ? Math.trunc(Math.abs(v)) % 2 ** 32 : 0;
  })();

  const f = rngFormatters(resolveDigitStyle(min, max, count, seedText));

  // The draw follows every input live; the same seed keeps it reproducible.
  const result = useMemo(
    () => drawIntegers({ min: toInt(min), max: toInt(max), count: toInt(count), allowDuplicates, sortOrder }, mulberry32(seedValue)),
    [min, max, count, allowDuplicates, sortOrder, seedValue]
  );

  const d: Draw | null = useMemo(() => {
    if (result.error) return null;
    const bins = histogram(result.drawn, result.lo, result.hi);
    const m = uniformMoments(result.lo, result.hi);
    return {
      lo: result.lo,
      hi: result.hi,
      n: result.hi - result.lo + 1,
      k: result.drawn.length,
      drawn: result.drawn,
      sum: result.sum,
      allowDuplicates,
      sorted: sortOrder !== "none",
      bins,
      chi: chiSquareUniform(bins),
      stats: sampleStats(result.drawn),
      mu: m.mean,
      sigma: m.sd,
    };
  }, [result, allowDuplicates, sortOrder]);

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setActivePreset(null);
  };

  function applyPreset(key: PresetKey) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setMin(String(p.settings.min));
    setMax(String(p.settings.max));
    setCount(String(p.settings.count));
    setAllowDuplicates(p.settings.allowDuplicates);
    setSortOrder(p.settings.sortOrder);
    setActivePreset(key);
  }

  function handleClear() {
    setMin(DEFAULTS.min);
    setMax(DEFAULTS.max);
    setCount(DEFAULTS.count);
    setAllowDuplicates(DEFAULTS.allowDuplicates);
    setSortOrder(DEFAULTS.sortOrder);
    setActivePreset(null);
    setSeedInput(String(freshSeed()));
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "histogram", label: tNav("draw") },
    { id: "spread", label: tNav("expect") },
    { id: "outcome-space", label: tNav("space") },
    { id: "worked-examples", label: tNav("examples") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <RandomNumberInputPanel
              min={min}
              onMinChange={edit(setMin)}
              max={max}
              onMaxChange={edit(setMax)}
              count={count}
              onCountChange={edit(setCount)}
              allowDuplicates={allowDuplicates}
              onAllowDuplicatesChange={edit(setAllowDuplicates)}
              sortOrder={sortOrder}
              onSortOrderChange={edit(setSortOrder)}
              seed={seedText}
              onSeedChange={setSeedInput}
              activePreset={activePreset}
              onPreset={applyPreset}
              onGenerate={() => setSeedInput(String(freshSeed()))}
              onClear={handleClear}
            />
          }
          stretchResult
          result={
            <div className="flex flex-col gap-6 lg:h-full">
              <RandomNumberResult result={result} seed={seedValue} f={f} />
              {d && <RandomNumberDrawOrder d={d} f={f} />}
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="random-number-generator" category="math" />}
        />
      </div>

      {/* Below the fold every card spans the full width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="random-number-generator" />

        {/* Group 1 — this draw */}
        <FrequencyHistogram d={d} f={f} />
        <RandomNumberRepeatExplorer
          n={d?.n ?? 1}
          k={d?.k ?? 1}
          allowDuplicates={allowDuplicates}
          onCountChange={(k) => edit(setCount)(String(k))}
          f={f}
          fallback={d ? undefined : <EmptyIndicator />}
        />
        <RunningAverage d={d} f={f} />
        <UniformityGauge d={d} f={f} />
        <AdSpace variant="leaderboard" />

        {/* Group 2 — what to expect */}
        <SpreadInRange d={d} f={f} />
        <SumFormula d={d} f={f} />
        <DistinctStacked d={d} f={f} />
        <AppearanceTrio d={d} f={f} />
        <AdSpace variant="leaderboard" />

        {/* Group 3 — how big and how fair the space is */}
        <OutcomeSpaceLog d={d} f={f} />
        <ModuloBiasCards d={d} f={f} />
        <EntropyZoneStrip d={d} f={f} />
        <PresetOddsTable d={d} f={f} active={activePreset} onApply={applyPreset} />
        <AdSpace variant="leaderboard" />

        <RandomNumberWorkedExamples />
      </div>

      {education}
    </>
  );
}
