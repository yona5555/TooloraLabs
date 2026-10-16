"use client";
import { useTranslations } from "next-intl";
import { fleschReadingEaseOf } from "@tooloralabs/tools";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { HARD_SYLLABLES } from "./rsScales";

const TOP_N = 8;

/** Ranked Horizontal Bar List (§31 #5): the polysyllabic words that pull the score down; click one to highlight it in the text. */
export default function RsHardWords() {
  const t = useTranslations("tools.readability-score-calculator.live.hardWords");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, words, f, pct, highlight, setHighlight } = useRsLive();

  const groups = new Map<string, { key: string; word: string; syllables: number; count: number }>();
  let occurrences = 0;
  let excess = 0;
  for (const w of words) {
    if (w.syllables < HARD_SYLLABLES) continue;
    occurrences++;
    excess += w.syllables - 2;
    const g = groups.get(w.key);
    if (g) g.count++;
    else groups.set(w.key, { key: w.key, word: w.word, syllables: w.syllables, count: 1 });
  }
  const list = [...groups.values()].sort((a, b) => b.syllables - a.syllables || b.count - a.count).slice(0, TOP_N);
  const max = Math.max(1, ...list.map((g) => g.syllables));
  // What the score would be if every hard word were swapped for a two-syllable one (same word and sentence counts).
  const simpler = result.wordCount ? fleschReadingEaseOf(result.averageWordsPerSentence, (result.syllableCount - excess) / result.wordCount) : 0;

  const indicator = (
    <div className="w-full sm:w-[320px]">
      {list.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("none")}</p>
      ) : (
        <ul className="space-y-1.5">
          {list.map((g, i) => {
            const on = highlight?.kind === "word" && highlight.key === g.key;
            return (
              <li key={g.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setHighlight(on ? null : { kind: "word", key: g.key, word: g.word })}
                  className={`grid w-full grid-cols-[1.25rem_7.5rem_1fr] items-center gap-2 rounded-lg px-1.5 py-1 text-start transition ${on ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  <span className="font-mono text-[11px] text-zinc-400">{f(i + 1)}</span>
                  <span dir="auto" className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{g.word}</span>
                  <span className="relative h-5 rounded bg-zinc-100 dark:bg-zinc-800">
                    <span
                      className={`absolute inset-y-0 start-0 rounded ${on ? "bg-amber-400" : g.syllables >= 5 ? "bg-red-500 dark:bg-red-500" : g.syllables === 4 ? "bg-orange-500" : "bg-amber-500"}`}
                      style={{ width: `${(g.syllables / max) * 100}%`, transition: "width 300ms ease" }}
                    />
                    <span dir="ltr" className="absolute inset-y-0 end-1.5 flex items-center font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-100">
                      {t("barValue", { syllables: f(g.syllables), count: f(g.count) })}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("unique"), value: f(groups.size) },
        { label: t("occurrences"), value: f(occurrences), note: pct(result.wordCount ? occurrences / result.wordCount : 0) },
        { label: t("extraSyllables"), value: f(excess), note: t("extraNote") },
        { label: tr("fleschReadingEase"), value: f(result.fleschReadingEase) },
        { label: t("simpler"), value: f(simpler), emphasize: true, note: t("gain", { n: f(simpler - result.fleschReadingEase) }) },
      ]}
    />
  );
}
