"use client";
import { useTranslations } from "next-intl";
import { READING_WPM, SPEAKING_WPM, wordLength } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import WordCounterShareExportModal from "./WordCounterShareExportModal";
import CompositionRing from "./CompositionRing";
import { useWcLive } from "./WcLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function WordCounterResult() {
  const t = useTranslations("tools.word-counter");
  const tl = useTranslations("tools.word-counter.live.table");
  const { stats, profile, f, pct, clock } = useWcLive();
  const hasText = stats.words > 0;

  const rows: Row[] = [
    { key: "words", label: t("stats.words"), value: f(stats.words), strong: true, note: tl("wordsNote", { unique: pct(stats.words ? stats.uniqueWords / stats.words : 0) }) },
    { key: "characters", label: t("stats.characters"), value: f(stats.characters), note: tl("charactersNote", { spaces: f(profile.composition.spaces) }) },
    { key: "charactersNoSpaces", label: t("stats.charactersNoSpaces"), value: f(stats.charactersNoSpaces), note: pct(stats.characters ? stats.charactersNoSpaces / stats.characters : 0) },
    { key: "sentences", label: t("stats.sentences"), value: f(stats.sentences), note: tl("sentencesNote", { longest: f(Math.max(0, ...profile.sentences.map((s) => s.words))) }) },
    { key: "paragraphs", label: t("stats.paragraphs"), value: f(stats.paragraphs), note: tl("paragraphsNote", { avg: f(stats.paragraphs ? stats.words / stats.paragraphs : 0) }) },
    { key: "uniqueWords", label: t("stats.uniqueWords"), value: f(stats.uniqueWords), note: tl("uniqueNote", { repeated: f(Math.max(0, profile.wordLengths.reduce((a, b) => a + b, 0) - stats.uniqueWords)) }) },
    { key: "averageWordLength", label: t("stats.averageWordLength"), value: f(stats.averageWordLength), note: tl("lettersUnit") },
    { key: "averageSentenceLength", label: tl("averageSentenceLength"), value: f(profile.averageSentenceLength), note: tl("wordsUnit") },
    { key: "reading", label: tl("readingTime"), value: clock(profile.readingSeconds), note: tl("readingNote", { wpm: f(READING_WPM) }) },
    { key: "speaking", label: tl("speakingTime"), value: clock(profile.speakingSeconds), note: tl("speakingNote", { wpm: f(SPEAKING_WPM) }) },
    { key: "longestWord", label: t("stats.longestWord"), value: stats.longestWord || "—", note: tl("lettersCount", { n: f(wordLength(stats.longestWord)) }) },
  ];

  const summaryText = rows.map((r) => `${r.label}: ${r.value}`).join("\n");

  return (
    <SectionCard phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-5 lg:flex lg:flex-1 lg:flex-col"
      action={
        hasText ? (
          <div className="flex items-center gap-2">
            <CopyButton text={summaryText} />
            <WordCounterShareExportModal
              operationLabel=""
              inputRows={[]}
              resultRows={rows.map((r) => ({ label: r.label, value: r.value }))}
              heroLabel={t("stats.words")}
              heroValue={f(stats.words)}
              sentence={summaryText}
            />
          </div>
        ) : undefined
      }
    >
      {hasText ? (
        <div className="flex flex-col gap-4 lg:flex-1 lg:flex-col-reverse">
          <table className="min-w-0 flex-1 border-collapse text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-zinc-200 last:border-0 dark:border-zinc-700/70">
                  <th scope="row" className="py-1.5 pe-2 text-start align-top font-medium text-zinc-600 dark:text-zinc-300">
                    {r.label}
                    {r.note && <span className="block text-[11px] font-normal text-zinc-400 dark:text-zinc-500">{r.note}</span>}
                  </th>
                  <td
                    dir={r.key === "longestWord" ? "auto" : "ltr"}
                    className={`py-1.5 text-end align-top font-semibold tabular-nums ${r.strong ? "text-xl text-blue-700 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"} ${r.key === "longestWord" ? "max-w-[9rem] break-all" : "font-mono"}`}
                  >
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <CompositionRing />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
