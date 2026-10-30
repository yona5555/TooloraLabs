"use client";
import { useTranslations } from "next-intl";
import { READING_SPEED_PRESETS } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import RTShareExportModal from "./RTShareExportModal";
import ReadingDial from "./ReadingDial";
import { useRtLive } from "./RtLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function RTResult() {
  const t = useTranslations("tools.reading-time-calculator");
  const tl = useTranslations("tools.reading-time-calculator.live.table");
  const { result, ok, wpm, preset, sentences, paragraphs, secondsFor, f, clock, timeLabel } = useRtLive();

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
  const longestPara = paragraphs.reduce((b, p) => (p.words > (b?.words ?? -1) ? p : b), paragraphs[0]);
  const rows: Row[] = [
    { key: "time", label: t("result.heading"), value: label, strong: true, note: tl("clockNote", { clock: clock(result.totalSeconds) }) },
    { key: "words", label: t("result.wordCountLabel"), value: f(words), note: tl("wordsNote") },
    { key: "wpm", label: t("form.speedLabel"), value: tl("wpmValue", { wpm: f(wpm) }), note: t(`form.presets.${preset}`) },
    { key: "seconds", label: tl("totalSeconds"), value: f(result.totalSeconds), note: tl("totalSecondsNote") },
    { key: "minutes", label: tl("decimalMinutes"), value: f(words / wpm, 2), note: `${f(words)} ÷ ${f(wpm)}` },
    { key: "wps", label: tl("wordsPerSecond"), value: f(wpm / 60, 2), note: `${f(wpm)} ÷ ${f(60)}` },
    { key: "sentences", label: tl("sentences"), value: f(sentences.length), note: tl("perSentence", { s: f(sentences.length ? secondsFor(words) / sentences.length : 0) }) },
    { key: "paragraphs", label: tl("paragraphs"), value: f(paragraphs.length), note: tl("perParagraph", { clock: clock(paragraphs.length ? secondsFor(words) / paragraphs.length : 0) }) },
    {
      key: "longest",
      label: tl("longestParagraph"),
      value: longestPara ? clock(secondsFor(longestPara.words)) : clock(0),
      note: longestPara ? tl("paragraphN", { n: f(longestPara.index + 1), words: f(longestPara.words) }) : undefined,
    },
    {
      key: "range",
      label: tl("presetRange"),
      value: `${clock(secondsFor(words, READING_SPEED_PRESETS.fast))} – ${clock(secondsFor(words, READING_SPEED_PRESETS.slow))}`,
      note: tl("presetRangeNote", { fast: f(READING_SPEED_PRESETS.fast), slow: f(READING_SPEED_PRESETS.slow) }),
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
          <RTShareExportModal
            operationLabel=""
            inputRows={[{ label: t("form.speedLabel"), value: tl("wpmValue", { wpm: f(wpm) }) }]}
            resultRows={rows.map((r) => ({ label: r.label, value: r.value }))}
            heroLabel={t("result.heading")}
            heroValue={label}
            sentence={`${label} — ${t("result.wordCountLabel")}: ${f(words)}`}
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
                  dir={r.strong || r.key === "wpm" ? "auto" : "ltr"}
                  className={`py-1.5 text-end align-top font-semibold tabular-nums ${r.strong ? "text-lg text-blue-700 dark:text-blue-400" : "font-mono text-zinc-900 dark:text-zinc-100"}`}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ReadingDial />
      </div>
    </SectionCard>
  );
}
