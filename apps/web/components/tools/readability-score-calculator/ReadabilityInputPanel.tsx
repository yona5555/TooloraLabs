"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Highlighter, RotateCcw, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { countSyllablesInWord, tokenizeWords } from "@tooloralabs/tools";
import { PASSAGE_EXAMPLES } from "./passageExamples";
import { HARD_SYLLABLES } from "./rsScales";
import { useRsLive, type RsHighlight } from "./RsLiveContext";

// Identical box metrics for the textarea and its highlight backdrop so the marks sit under the right letters.
const BOX = "[scrollbar-gutter:stable] px-4 py-3 text-base leading-7 whitespace-pre-wrap break-words [overflow-wrap:anywhere]";

function matches(h: NonNullable<RsHighlight>, key: string, word: string) {
  if (h.kind === "word") return key === h.key;
  const n = countSyllablesInWord(word);
  return n >= h.min && n <= h.max;
}

/** Backdrop copy of the text with every highlighted word wrapped in <mark> (same tokens as the indicators). */
function Marked({ text, highlight }: { text: string; highlight: NonNullable<RsHighlight> }) {
  const parts = useMemo(() => {
    const out: ReactNode[] = [];
    let last = 0;
    for (const tok of tokenizeWords(text)) {
      if (!matches(highlight, tok.key, tok.word)) continue;
      out.push(text.slice(last, tok.start));
      out.push(
        <mark key={tok.start} className="rounded-sm bg-amber-300/80 text-transparent dark:bg-amber-400/50">
          {tok.word}
        </mark>,
      );
      last = tok.end;
    }
    out.push(text.slice(last) + "\n");
    return out;
  }, [text, highlight]);
  return <>{parts}</>;
}

export default function ReadabilityInputPanel({ sampleText }: { sampleText: string }) {
  const t = useTranslations("tools.readability-score-calculator.form");
  const tl = useTranslations("tools.readability-score-calculator.live");
  const tExamples = useTranslations("tools.readability-score-calculator.gauge.examples");
  const tq = useTranslations("tools.readability-score-calculator.aboveFold.quickReference");
  const { text, setText, highlight, setHighlight, textareaRef, result, ok, f, sentences } = useRsLive();
  const backdropRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) backdropRef.current.scrollTop = textareaRef.current.scrollTop;
  };
  useEffect(syncScroll, [highlight, text, textareaRef]);

  const hardOn = highlight?.kind === "syllables" && highlight.min === HARD_SYLLABLES && highlight.max === Infinity;
  const chip =
    highlight == null
      ? null
      : highlight.kind === "word"
        ? tl("highlightingWord", { word: highlight.word })
        : highlight.max === Infinity
          ? tl("highlightingAtLeast", { n: f(highlight.min) })
          : tl("highlightingExactly", { n: f(highlight.min) });
  const fragments = sentences.filter((s) => !s.terminated).length;

  return (
    <SectionCard title={t("inputTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col">
      <span className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t("scenarioPresetsLabel")}</span>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PASSAGE_EXAMPLES.map((example) => (
          <button
            key={example.key}
            type="button"
            onClick={() => setText(example.text)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              text === example.text
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setText(sampleText)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current"
        >
          {tl("loadSample")}
        </button>
        <button
          type="button"
          aria-pressed={hardOn}
          onClick={() => setHighlight(hardOn ? null : { kind: "syllables", min: HARD_SYLLABLES, max: Infinity })}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            hardOn
              ? "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500/60 dark:bg-amber-500/20 dark:text-amber-200"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Highlighter size={14} />
          {tl("markHard")}
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={14} />
          {t("clear")}
        </button>
        {chip && !hardOn && (
          <button
            type="button"
            onClick={() => setHighlight(null)}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          >
            <span dir="auto">{chip}</span>
            <X size={12} />
          </button>
        )}
      </div>
      <label className="relative block rounded-xl border border-zinc-300 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/20 lg:flex lg:flex-1">
        <span className="sr-only">{t("inputLabel")}</span>
        {highlight && (
          <div ref={backdropRef} aria-hidden dir="auto" className={`pointer-events-none absolute inset-0 overflow-hidden text-transparent ${BOX}`}>
            <Marked text={text} highlight={highlight} />
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          dir="auto"
          onChange={(e) => setText(e.target.value)}
          onScroll={syncScroll}
          placeholder={t("inputPlaceholder")}
          rows={14}
          className={`relative block min-h-[20rem] w-full resize-none overflow-y-auto rounded-xl bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 selection:bg-blue-300/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:selection:bg-blue-500/50 lg:flex-1 ${BOX}`}
        />
      </label>
      <p dir="auto" className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {ok
          ? tl("inputFooter", { words: f(result.wordCount), sentences: f(result.sentenceCount), syllables: f(result.syllableCount) })
          : t("inputHint")}
        {ok && fragments > 0 && <span className="text-amber-700 dark:text-amber-300"> · {tl("table.fragmentsNote", { n: f(fragments) })}</span>}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">{tq("englishOnlyNote")}</p>
    </SectionCard>
  );
}
