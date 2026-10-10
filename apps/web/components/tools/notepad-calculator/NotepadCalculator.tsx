"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { NotepadCalculator as NotepadCalculatorTool, analyzeNotepad, inputImpacts, rewriteAssignment } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import NotepadInputPanel from "./NotepadInputPanel";
import NotepadResult, { NotepadNudge, NotepadSyntaxTable } from "./NotepadResult";
import NotepadWhatIfLab from "./NotepadWhatIfLab";
import NotepadWorkedExamples from "./NotepadWorkedExamples";
import {
  CompositionDonut,
  DependencyFlow,
  EvaluationStairs,
  InputImpactBars,
  LineValuesTrend,
  LiveFormula,
  MagnitudeScale,
  RoundingEquivalence,
  ScopeTimeline,
  SensitivityTrio,
  VariablesRanked,
} from "./NotepadIndicators";
import { lineNo, num } from "./format";
import { buildSnippet, type SnippetKey } from "./types";

const tool = new NotepadCalculatorTool();
const RELATED_TOOLS = ["scientific-calculator", "step-by-step-math-solver", "percentage-calculator", "graphing-calculator"];

export default function NotepadCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.notepad-calculator.nav");
  const t = useTranslations("tools.notepad-calculator");
  const tP = useTranslations("tools.notepad-calculator.samples");
  // The sample trip budget is rendered on the server too, so every indicator is live on first paint.
  const [text, setText] = useState(() => buildSnippet("trip", tP));
  const [pickedLine, setPickedLine] = useState<number | null>(null);
  const [variable, setVariable] = useState<string | null>(null);

  const result = useMemo(() => tool.execute({ text }, { locale: "en-US" }).data, [text]);
  const a = useMemo(() => analyzeNotepad(text), [text]);
  // A picked line only stays selected while it still has a result; otherwise follow the bottom line.
  const line = pickedLine !== null && a.lines[pickedLine]?.value != null ? pickedLine : a.finalIndex;

  function loadSnippet(key: SnippetKey) {
    setText(buildSnippet(key, tP));
    setPickedLine(null);
    setVariable(null);
  }

  const applyValue = (i: number, value: number) => setText((prev) => rewriteAssignment(prev, i, value));

  function pickLine(i: number) {
    setPickedLine(i);
    document.getElementById("steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Until the visitor picks one, the what-if cards start on the input that moves the bottom line most.
  const strongest = useMemo(() => inputImpacts(a, text, 10)[0]?.name ?? null, [a, text]);

  const ind = { a, text };
  const lineProps = { ...ind, line, onLine: setPickedLine };
  const varProps = { ...ind, variable: variable ?? strongest, onVariable: setVariable };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "line-values", label: tNav("overview") },
    { id: "steps", label: tNav("evaluation") },
    { id: "what-if", label: tNav("whatIf") },
    { id: "worked-examples", label: tNav("examples") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <NotepadInputPanel text={text} onChange={setText} onSnippet={loadSnippet} onClear={() => setText("")} />
              <NotepadNudge a={a} text={text} onSetInput={applyValue} />
            </div>
          }
          result={
            <div className="flex flex-col gap-6">
              <NotepadResult result={result} a={a} onPickLine={pickLine} />
              <NotepadSyntaxTable onInsert={(expr) => setText((prev) => (prev.trim() ? `${prev.replace(/\n+$/, "")}\n${expr}` : expr))} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="notepad-calculator" category="math" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />}
          sidebarFill={
            <SidebarFillList
              title={t("sidebar.title", { count: a.variables.length })}
              note={t("sidebar.note")}
              rows={[
                ...a.variables.map((v) => ({ id: v.name, label: v.name, sub: `${lineNo(v.line)} · ${v.isInput ? t("sidebar.input") : t("sidebar.derived")}`, value: num(v.value) })),
                { id: "s-lines", label: t("sidebar.lines"), value: `${a.counts.calculated} / ${a.counts.nonBlank}` },
                { id: "s-final", label: t("sidebar.bottom"), value: a.finalValue !== null ? num(a.finalValue) : "—" },
              ]}
            />
          }
        />
      </div>

      {/* Below the fold every card spans the full width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="notepad-calculator" />

        {/* Group 1 — what the notes contain */}
        <LineValuesTrend {...ind} />
        <CompositionDonut {...ind} />
        <VariablesRanked {...ind} />
        <AdSpace variant="leaderboard" />

        {/* Group 2 — how one line is evaluated */}
        <EvaluationStairs {...lineProps} />
        <LiveFormula {...lineProps} />
        <DependencyFlow {...ind} />
        <AdSpace variant="leaderboard" />

        {/* Group 3 — what-if on the inputs */}
        <NotepadWhatIfLab {...varProps} onApply={applyValue} />
        <SensitivityTrio {...varProps} />
        <InputImpactBars {...ind} />
        <AdSpace variant="leaderboard" />

        {/* Group 4 — scope and precision */}
        <ScopeTimeline {...ind} />
        <MagnitudeScale {...ind} />
        <RoundingEquivalence {...lineProps} />
        <AdSpace variant="leaderboard" />

        <NotepadWorkedExamples />
      </div>

      {education}
    </>
  );
}
