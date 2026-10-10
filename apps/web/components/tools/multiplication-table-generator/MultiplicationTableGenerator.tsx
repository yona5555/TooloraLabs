"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  MultiplicationTableCalculator as MTTool,
  mtDigitalRoot,
  mtDistinctProducts,
  mtFactorPairs,
  mtGridSum,
  mtMemorySteps,
  mtRowSum,
  mtUnitsCycle,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import MTInputPanel from "./MTInputPanel";
import MTResult from "./MTResult";
import MTAreaModelLab from "./MTAreaModelLab";
import MTWorkedExamples from "./MTWorkedExamples";
import {
  ArrayModel,
  DigitalRootStrip,
  DistinctTrend,
  DistributiveBalance,
  FactorPairsEquivalence,
  GridSumFormula,
  MemoryStairs,
  NeighbourTrio,
  ProductBars,
  RowSumStacked,
  UnitsDigitTimeline,
  primeString,
} from "./MTIndicators";
import type { MtView, MultiplicationTableMode } from "./types";

const tool = new MTTool();
const RELATED_TOOLS = ["gcf-lcm-calculator", "percentage-calculator", "step-by-step-math-solver", "roman-numeral-converter"];
const DEFAULTS = { number: "7", max: "12", from: "1", to: "12", k: 8, row: 7, col: 8 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function MultiplicationTableGenerator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.multiplication-table-generator");
  const tNav = useTranslations("tools.multiplication-table-generator.nav");
  const [mode, setMode] = useState<MultiplicationTableMode>("single");
  const [number, setNumber] = useState(DEFAULTS.number);
  const [maxMultiplier, setMaxMultiplier] = useState(DEFAULTS.max);
  const [rangeStart, setRangeStart] = useState(DEFAULTS.from);
  const [rangeEnd, setRangeEnd] = useState(DEFAULTS.to);
  const [k, setK] = useState(DEFAULTS.k);
  const [cell, setCell] = useState({ row: DEFAULTS.row, col: DEFAULTS.col });
  const [playing, setPlaying] = useState(false);

  function handleClear() {
    setMode("single");
    setNumber(DEFAULTS.number);
    setMaxMultiplier(DEFAULTS.max);
    setRangeStart(DEFAULTS.from);
    setRangeEnd(DEFAULTS.to);
    setK(DEFAULTS.k);
    setCell({ row: DEFAULTS.row, col: DEFAULTS.col });
    setPlaying(false);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(number, maxMultiplier, rangeStart, rangeEnd);

  const result = useMemo(
    () =>
      tool.execute(
        {
          mode,
          number: parseLocalizedNumber(number),
          maxMultiplier: parseLocalizedNumber(maxMultiplier),
          rangeStart: parseLocalizedNumber(rangeStart),
          rangeEnd: parseLocalizedNumber(rangeEnd),
        },
        { locale: "en-US" }
      ).data,
    [mode, number, maxMultiplier, rangeStart, rangeEnd]
  );

  // The selected fact a × b that every indicator follows.
  const view = useMemo<MtView | null>(() => {
    if (result.error) return null;
    const fmt = (n: number) => formatLocalizedNumber(n, digitStyle);
    if (result.singleRows) {
      const a = result.singleRows[0].result;
      const multipliers = result.singleRows.map((r) => r.multiplier);
      const m = multipliers.length;
      const b = clamp(k, 1, m);
      return { mode, a, b, product: a * b, multipliers, lo: 1, hi: Math.min(m, 30), fmt };
    }
    const headers = result.grid!.headers;
    const lo = headers[0];
    const hi = headers[headers.length - 1];
    const a = clamp(cell.row, lo, hi);
    const b = clamp(cell.col, lo, hi);
    return { mode, a, b, product: a * b, multipliers: headers, lo, hi, fmt };
  }, [result, k, cell, mode, digitStyle]);

  function pick(a: number, b: number) {
    if (mode === "single") {
      if (a >= 1 && a <= 1000 && String(a) !== number) setNumber(String(a));
      const m = parseLocalizedNumber(maxMultiplier);
      if (b > m && b <= 100) setMaxMultiplier(String(b));
      setK(Math.max(1, Math.min(100, b)));
    } else if (view) {
      setCell({ row: clamp(a, view.lo, view.hi), col: clamp(b, view.lo, view.hi) });
    }
  }

  // "Play" walks the selected multiplier through the table, so the hero and every indicator animate.
  useEffect(() => {
    if (!playing || !view) return;
    const id = setInterval(() => {
      const list = view.multipliers;
      const next = list[(list.indexOf(view.b) + 1) % list.length];
      if (mode === "single") setK(next);
      else setCell((c) => ({ ...c, col: next }));
    }, 800);
    return () => clearInterval(id);
  }, [playing, view, mode]);

  const ind = view ? { view, onPick: pick } : null;

  const sidebarRows = view
    ? (() => {
        const f = view.fmt;
        const row = mtRowSum(view.a, view.multipliers);
        const steps = mtMemorySteps(view.lo, view.hi);
        return [
          { id: "fact", label: t("sidebar.fact"), value: `${f(view.a)} × ${f(view.b)} = ${f(view.product)}` },
          { id: "primes", label: t("sidebar.primes"), value: primeString(view.product) },
          { id: "pairs", label: t("sidebar.pairs"), value: f(mtFactorPairs(view.product).length) },
          { id: "root", label: t("sidebar.root"), value: f(mtDigitalRoot(view.product)) },
          { id: "units", label: t("sidebar.units"), value: f(mtUnitsCycle(view.a).period) },
          { id: "row", label: t("sidebar.rowSum", { a: f(view.a) }), value: f(row.sum) },
          { id: "grid", label: t("sidebar.gridSum", { lo: f(view.lo), hi: f(view.hi) }), value: f(mtGridSum(view.lo, view.hi).sum) },
          { id: "distinct", label: t("sidebar.distinct"), value: `${f(mtDistinctProducts(view.lo, view.hi))} / ${f((view.hi - view.lo + 1) ** 2)}` },
          { id: "hard", label: t("sidebar.hard"), value: f(steps[steps.length - 1].remaining) },
          ...view.multipliers.slice(0, 30).map((m) => ({ id: `m${m}`, label: `${f(view.a)} × ${f(m)}`, value: f(view.a * m) })),
        ];
      })()
    : [];

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "area-model", label: tNav("models") },
    { id: "neighbours", label: tNav("totals") },
    { id: "units-digits", label: tNav("patterns") },
    { id: "worked-examples", label: tNav("examples") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <MTInputPanel
              mode={mode}
              onModeChange={(m) => {
                setMode(m);
                setPlaying(false);
              }}
              number={number}
              onNumberChange={setNumber}
              maxMultiplier={maxMultiplier}
              onMaxMultiplierChange={setMaxMultiplier}
              rangeStart={rangeStart}
              onRangeStartChange={setRangeStart}
              rangeEnd={rangeEnd}
              onRangeEndChange={setRangeEnd}
              onRangePreset={(lo, hi) => {
                setRangeStart(String(lo));
                setRangeEnd(String(hi));
              }}
              onPick={pick}
              onClear={handleClear}
              view={view}
            />
          }
          result={<MTResult result={result} view={view} onPick={pick} playing={playing} onTogglePlay={() => setPlaying((p) => !p)} />}
          sidebar={<RelatedToolsSidebar currentSlug="multiplication-table-generator" category="math" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />}
          secondary={ind ? <ProductBars {...ind} /> : undefined}
          sidebarFill={view ? <SidebarFillList title={t("sidebar.title")} note={t("sidebar.note")} rows={sidebarRows} /> : undefined}
        />
      </div>

      {/* Below the fold every card spans the full width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="multiplication-table-generator" />

        {ind ? (
          <>
            {/* Group 1 — what a product looks like */}
            <MTAreaModelLab {...ind} />
            <ArrayModel {...ind} />
            <DistributiveBalance {...ind} />
            <AdSpace variant="leaderboard" />

            {/* Group 2 — neighbours, rows and the whole grid */}
            <NeighbourTrio {...ind} />
            <RowSumStacked {...ind} />
            <GridSumFormula {...ind} />
            <DistinctTrend {...ind} />
            <AdSpace variant="leaderboard" />

            {/* Group 3 — digit patterns and memorising */}
            <UnitsDigitTimeline {...ind} />
            <DigitalRootStrip {...ind} />
            <FactorPairsEquivalence {...ind} />
            <MemoryStairs {...ind} />
            <AdSpace variant="leaderboard" />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("ind.empty")}</p>
        )}

        <MTWorkedExamples />
      </div>

      {education}
    </>
  );
}
