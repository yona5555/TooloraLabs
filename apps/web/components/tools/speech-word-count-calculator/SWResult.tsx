"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import SpeechWordCountShareExportModal from "./SpeechWordCountShareExportModal";
import PaceRings from "./PaceRings";
import { SPEECH_PACE_PRESETS } from "./types";
import { useSwLive } from "./SwLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function SWResult() {
  const t = useTranslations("tools.speech-word-count-calculator");
  const tl = useTranslations("tools.speech-word-count-calculator.live.table");
  const { result, ok, wpm, preset, sentences, paragraphs, secondsFor, f, clock, timeLabel } = useSwLive();

  if (!ok) {
    return (
      <SectionCard phoneRole="output" title={t("result.heading")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm leading-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          {t(result.error === "empty-text" ? "result.emptyText" : "result.invalidRate")}
        </p>
      </SectionCard>
    );
  }

  const label = timeLabel(result.totalSeconds);
  const words = result.wordCount;
  const longest = sentences.reduce((b, s) => (s.words > (b?.words ?? -1) ? s : b), sentences[0]);
  const rows: Row[] = [
    { key: "time", label: t("result.heading"), value: label, strong: true, note: tl("clockNote", { clock: clock(result.totalSeconds) }) },
    { key: "words", label: t("result.wordCountLabel"), value: f(words), note: tl("wordsNote") },
    { key: "wpm", label: t("form.paceLabel"), value: tl("wpmValue", { wpm: f(wpm) }), note: t(`form.presets.${preset}`) },
    { key: "seconds", label: tl("totalSeconds"), value: f(result.totalSeconds), note: tl("totalSecondsNote") },
    { key: "minutes", label: tl("decimalMinutes"), value: f(words / wpm, 2), note: `${f(words)} ÷ ${f(wpm)}` },
    { key: "wps", label: tl("wordsPerSecond"), value: f(wpm / 60, 2), note: `${f(wpm)} ÷ ${f(60)}` },
    { key: "sentences", label: tl("sentences"), value: f(sentences.length), note: tl("perSentence", { s: f(sentences.length ? secondsFor(words) / sentences.length : 0) }) },
    { key: "paragraphs", label: tl("paragraphs"), value: f(paragraphs.length), note: tl("perParagraph", { clock: clock(paragraphs.length ? secondsFor(words) / paragraphs.length : 0) }) },
    {
      key: "longest",
      label: tl("longestSentence"),
      value: tl("secondsValue", { s: f(longest ? secondsFor(longest.words) : 0) }),
      note: longest ? tl("sentenceN", { n: f(longest.index + 1), words: f(longest.words) }) : undefined,
    },
    {
      key: "range",
      label: tl("presetRange"),
      value: `${clock(secondsFor(words, SPEECH_PACE_PRESETS.fast))} – ${clock(secondsFor(words, SPEECH_PACE_PRESETS.formal))}`,
      note: tl("presetRangeNote", { fast: f(SPEECH_PACE_PRESETS.fast), formal: f(SPEECH_PACE_PRESETS.formal) }),
    },
  ];
  const summaryText = rows.map((r) => `${r.label}: ${r.value}`).join("\n");

  return (
    <SectionCard phoneRole="output"
      title={t("result.heading")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-5 lg:flex lg:flex-1 lg:flex-col"
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={summaryText} />
          <SpeechWordCountShareExportModal
            inputRows={[
              { label: t("shareExport.wordCountLabel"), value: f(words) },
              { label: t("shareExport.paceLabel"), value: `${wpm} WPM` },
            ]}
            resultRows={rows.map((r) => ({ label: r.label, value: r.value }))}
            heroLabel={t("result.heading")}
            heroValue={label}
            sentence={t("shareExport.sentence", { words, wpm, time: label })}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 lg:flex-1 lg:flex-col-reverse">
        <table className="min-w-0 flex-1 border-collapse text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-zinc-200 last:border-0 dark:border-zinc-700/70">
                <th scope="row" className="py-1.5 pe-2 text-start align-top font-medium text-zinc-600 dark:text-zinc-300">
                  {r.label}
                  {r.note && <span className="block text-xs font-normal text-zinc-400 dark:text-zinc-500">{r.note}</span>}
                </th>
                <td
                  dir={r.strong || r.key === "wpm" || r.key === "longest" ? "auto" : "ltr"}
                  className={`py-1.5 text-end align-top font-semibold tabular-nums ${r.strong ? "text-lg text-blue-700 dark:text-blue-400" : "font-mono text-zinc-900 dark:text-zinc-100"}`}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaceRings />
      </div>
    </SectionCard>
  );
}
