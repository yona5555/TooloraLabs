"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { tokenizeWords } from "@tooloralabs/tools";
import { useWcLive } from "./WcLiveContext";

// Identical box metrics for the textarea and its highlight backdrop so the marks sit under the right letters.
const BOX = "[scrollbar-gutter:stable] px-4 py-3 text-base leading-7 whitespace-pre-wrap break-words [overflow-wrap:anywhere]";

/** Backdrop copy of the text with every occurrence of the highlighted keyword wrapped in <mark>. */
function Marked({ text, word }: { text: string; word: string }) {
  const parts = useMemo(() => {
    const out: ReactNode[] = [];
    let last = 0;
    // Same tokens and keys as the keyword list, so "الدَّرْسَ" and "الدرس" both light up.
    for (const tok of tokenizeWords(text)) {
      if (tok.key !== word) continue;
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
  }, [text, word]);
  return <>{parts}</>;
}

export default function WordCounterInputPanel({ sampleText }: { sampleText: string }) {
  const t = useTranslations("tools.word-counter.form");
  const tl = useTranslations("tools.word-counter.live");
  const { text, setText, highlight, setHighlight, textareaRef, stats, f } = useWcLive();
  const backdropRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) backdropRef.current.scrollTop = textareaRef.current.scrollTop;
  };
  useEffect(syncScroll, [highlight, text, textareaRef]);

  return (
    <SectionCard phoneRole="input" title={t("inputTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setText(sampleText)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:text-sm"
        >
          <RotateCcw size={14} />
          {t("clear")}
        </button>
        {highlight && (
          <button
            type="button"
            onClick={() => setHighlight(null)}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          >
            <span dir="auto">{tl("highlighting", { word: highlight })}</span>
            <X size={12} />
          </button>
        )}
      </div>
      <label className="relative block rounded-xl border border-zinc-300 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/20 lg:flex lg:flex-1">
        <span className="sr-only">{t("inputLabel")}</span>
        {highlight && (
          <div ref={backdropRef} aria-hidden dir="auto" className={`pointer-events-none absolute inset-0 overflow-hidden text-transparent ${BOX}`}>
            <Marked text={text} word={highlight} />
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          dir="auto"
          onChange={(e) => setText(e.target.value)}
          onScroll={syncScroll}
          placeholder={t("inputPlaceholder")}
          rows={16}
          className={`relative block min-h-[22rem] w-full resize-none overflow-y-auto rounded-xl bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 selection:bg-blue-300/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:selection:bg-blue-500/50 lg:flex-1 ${BOX}`}
        />
      </label>
      <p dir="auto" className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {tl("inputFooter", { words: f(stats.words), characters: f(stats.characters) })}
      </p>
    </SectionCard>
  );
}
