"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { analyzeGraph, compileFunction } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import GraphInputPanel from "./GraphInputPanel";
import GraphResult from "./GraphResult";
import GraphQuickReference from "./GraphQuickReference";
import { GraphLiveProvider } from "./GraphLiveContext";
import { emptyGraphDraft, GRAPH_EXAMPLES, type GraphDraft } from "./types";

const DEFAULT_DRAFT: GraphDraft = emptyGraphDraft();
const RELATED_TOOLS = ["step-by-step-math-solver", "scientific-calculator", "matrix-calculator"];

type Committed = { expression: string; xMin: number; xMax: number };
type DraftError = "invalidExpression" | "invalidRange" | "noValidPoints" | null;

/** Validates a draft; returns the numbers to graph or the reason it can't be graphed. */
function checkDraft(draft: GraphDraft): { ok: Committed | null; error: DraftError } {
  const xMin = parseLocalizedNumber(draft.xMin);
  const xMax = parseLocalizedNumber(draft.xMax);
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || !(xMax > xMin)) return { ok: null, error: "invalidRange" };
  const f = compileFunction(draft.expression);
  if (!f) return { ok: null, error: "invalidExpression" };
  let any = false;
  for (let i = 0; i <= 40 && !any; i++) any = f(xMin + ((xMax - xMin) * i) / 40) !== null;
  if (!any) return { ok: null, error: "noValidPoints" };
  return { ok: { expression: draft.expression, xMin, xMax }, error: null };
}

const DEFAULT_COMMITTED = checkDraft(DEFAULT_DRAFT).ok as Committed;

export default function GraphingCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.graphing-calculator.nav");
  const t = useTranslations("tools.graphing-calculator");
  const tq = useTranslations("tools.graphing-calculator.quickExamples");
  const [draft, setDraft] = useState<GraphDraft>(DEFAULT_DRAFT);
  const [committed, setCommitted] = useState<Committed>(DEFAULT_COMMITTED);
  const [draftError, setDraftError] = useState<DraftError>(null);
  const [traceX, setTraceXRaw] = useState(1.5);

  function applyDraft(next: GraphDraft) {
    setDraft(next);
    const { ok, error } = checkDraft(next);
    setDraftError(error);
    if (ok) {
      setCommitted(ok);
      setTraceXRaw((x) => (x >= ok.xMin && x <= ok.xMax ? x : ok.xMin + (ok.xMax - ok.xMin) * 0.75));
    }
  }

  const live = useMemo(() => {
    const f = compileFunction(committed.expression)!;
    return { f, analysis: analyzeGraph(f, committed.xMin, committed.xMax) };
  }, [committed]);

  const { xMin: cMin, xMax: cMax } = committed;
  const setTraceX = useCallback(
    (x: number | ((prev: number) => number)) =>
      setTraceXRaw((prev) => Math.min(cMax, Math.max(cMin, typeof x === "function" ? x(prev) : x))),
    [cMin, cMax],
  );
  const activeExample = GRAPH_EXAMPLES.find((ex) => ex.expression === draft.expression && ex.xMin === draft.xMin && ex.xMax === draft.xMax)?.id ?? null;

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GraphLiveProvider value={{ ...committed, ...live, traceX, setTraceX }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex h-full flex-col gap-6">
              <GraphInputPanel draft={draft} error={draftError} onChange={applyDraft} onClear={() => applyDraft(DEFAULT_DRAFT)} />
              <QuickExamplesCard
                className="lg:flex-1"
                title={tq("title")}
                activeId={activeExample}
                examples={GRAPH_EXAMPLES.map((ex) => ({ id: ex.id, label: tq(`items.${ex.id}`), detail: `${ex.expression} · [${ex.xMin}, ${ex.xMax}]` }))}
                onPick={(id) => {
                  const ex = GRAPH_EXAMPLES.find((e) => e.id === id);
                  if (ex) applyDraft({ expression: ex.expression, xMin: ex.xMin, xMax: ex.xMax });
                }}
              />
            </div>
          }
          result={<GraphResult />}
          sidebar={
            <RelatedToolsSidebar fill
              currentSlug="graphing-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="graphing-calculator" />
              <GraphQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </GraphLiveProvider>
  );
}
