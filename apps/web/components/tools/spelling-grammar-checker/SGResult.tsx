"use client";
import { type ReactNode } from "react";
import { Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { SpellingGrammarOutput, IssueType } from "./types";
import SpellingGrammarShareExportModal from "./SpellingGrammarShareExportModal";
import SGScene from "./SGScene";
import { ISSUE_TYPES, TYPE_COLOR } from "./sgMath";

type Props = {
  /** The text the tool checked (the field, or the stored example while the field is empty). */
  text: string;
  result: SpellingGrammarOutput;
  isExample: boolean;
  sourceLen: number;
  words: number;
  totalWords: number;
  onWords: (v: number) => void;
};

function renderHighlighted(text: string, issues: SpellingGrammarOutput["issues"]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  issues.forEach((issue, i) => {
    if (issue.start < cursor) return;
    if (issue.start > cursor) nodes.push(text.slice(cursor, issue.start));
    nodes.push(
      <mark
        key={i}
        title={issue.message}
        className="rounded-sm px-0.5 underline decoration-2"
        style={{ background: `color-mix(in oklab, ${TYPE_COLOR[issue.type]} 22%, transparent)`, color: "inherit", textDecorationColor: TYPE_COLOR[issue.type] }}
      >
        {text.slice(issue.start, issue.end)}
      </mark>,
    );
    cursor = issue.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * §44 (2D): the Results card carries the issue map at its top, then the counts, the highlighted
 * text and the suggestions, all inside this one card.
 */
export default function SGResult({ text, result, isExample, sourceLen, words, totalWords, onWords }: Props) {
  const t = useTranslations("tools.spelling-grammar-checker.result");
  const tRoot = useTranslations("tools.spelling-grammar-checker");
  const tLegend = useTranslations("tools.spelling-grammar-checker.quickReference.legend");
  const tc = useTranslations("toolPage.indicatorKit");

  const countsByType = ISSUE_TYPES.reduce<Record<IssueType, number>>(
    (acc, type) => {
      acc[type] = result.issues.filter((issue) => issue.type === type).length;
      return acc;
    },
    { spelling: 0, grammar: 0, capitalization: 0, punctuation: 0 },
  );

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="sg-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {!isExample && (
              <SpellingGrammarShareExportModal
                resultRows={[
                  { label: t("wordCountLabel"), value: String(result.wordCount) },
                  { label: t("issueCountLabel"), value: String(result.issues.length) },
                  ...ISSUE_TYPES.map((type) => ({ label: tLegend(type), value: String(countsByType[type]) })),
                ]}
                heroLabel={t("issueCountLabel")}
                heroValue={String(result.issues.length)}
                sentence={tRoot("shareExport.sentence", { words: result.wordCount, issues: result.issues.length })}
              />
            )}
          </span>
        }
      >
        <SGScene issues={result.issues} checkedLen={text.length} sourceLen={sourceLen} words={words} totalWords={totalWords} onWords={onWords} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />

        <div data-ph-result-values className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
          <div className="grid grid-cols-2 gap-1.5 text-sm">
            {[
              { k: "words", label: t("wordCountLabel"), value: result.wordCount, color: "var(--ph-ink)" },
              { k: "issues", label: t("issueCountLabel"), value: result.issues.length, color: result.issues.length === 0 ? "var(--ai-c)" : "var(--ph-ink)" },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2" style={{ background: "var(--glass-table-wrap-bg)" }}>
                <span style={{ color: "var(--ph-ink-muted)" }}>{r.label}</span>
                <span dir="ltr" data-testid={`sg-${r.k}`} className="font-bold tabular-nums" style={{ color: r.color }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isExample && (
              <span data-testid="sg-example" className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "var(--ai-soft)", color: "var(--ph-ink)" }}>
                {tRoot("visuals.example")}
              </span>
            )}
            {ISSUE_TYPES.filter((type) => countsByType[type] > 0).map((type) => (
              <span key={type} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `color-mix(in oklab, ${TYPE_COLOR[type]} 20%, transparent)`, color: "var(--ph-ink)" }}>
                {tLegend(type)}: {countsByType[type]}
              </span>
            ))}
          </div>

          <div dir="auto" className="rounded-xl p-3 text-sm leading-7" style={{ background: "var(--glass-table-wrap-bg)", color: "var(--ph-ink)" }}>
            {result.issues.length > 0 ? renderHighlighted(text, result.issues) : text}
          </div>

          {/* Desktop: the suggestion list fills the card's spare height and scrolls inside it (the row stays as tall as the sidebar, §41). */}
          {result.issues.length > 0 && (
            <ul data-testid="sg-issue-list" tabIndex={0} className="space-y-1.5 text-sm lg:min-h-[6rem] lg:flex-1 lg:basis-0 lg:overflow-y-auto">
              {result.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_COLOR[issue.type] }} />
                  <span style={{ color: "var(--ph-ink-muted)" }}>
                    {issue.message}
                    {issue.suggestion && (
                      <>
                        {" "}
                        {t("suggestion")}{" "}
                        <span dir="ltr" className="font-semibold" style={{ color: "var(--ph-ink)" }}>
                          {issue.suggestion}
                        </span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
