"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import ReadabilityShareExportModal from "./ReadabilityShareExportModal";
import ScoreDial from "./ScoreDial";
import { EASE_BANDS, EASE_MAX, EASE_MIN, HARD_SYLLABLES, clampEase, gradeBand } from "./rsScales";
import { useRsLive } from "./RsLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function ReadabilityResult() {
  const t = useTranslations("tools.readability-score-calculator.result");
  const tl = useTranslations("tools.readability-score-calculator.live.table");
  const tGrade = useTranslations("tools.readability-score-calculator.gradeLevelDiagram.bands");
  const { result, ok, sentences, words, f, pct, activeSentence, selectSentence } = useRsLive();

  const bandLabel = result.readingEaseLabel ? t(`bands.${result.readingEaseLabel}`) : "";
  const scored = sentences.filter((s) => s.terminated && s.words > 0);
  const hardest = scored.reduce<(typeof scored)[number] | undefined>((a, s) => (!a || s.ease < a.ease ? s : a), undefined);
  const easiest = scored.reduce<(typeof scored)[number] | undefined>((a, s) => (!a || s.ease > a.ease ? s : a), undefined);
  const hard = words.filter((w) => w.syllables >= HARD_SYLLABLES).length;
  const fragments = sentences.filter((s) => !s.terminated).length;
  const longest = Math.max(0, ...scored.map((s) => s.words));
  // Points still needed to reach the next easier band (none once at the top band).
  const next = EASE_BANDS.find((b) => b.from > clampEase(result.fleschReadingEase) && b.from > EASE_MIN && b.from < EASE_MAX);

  const rows: Row[] = [
    {
      key: "fre",
      label: t("fleschReadingEase"),
      value: f(result.fleschReadingEase),
      strong: true,
      note: next ? tl("easeNote", { band: bandLabel, points: f(next.from - result.fleschReadingEase), next: t(`bands.${next.key}`) }) : bandLabel,
    },
    { key: "fk", label: t("fleschKincaidGrade"), value: f(result.fleschKincaidGrade), note: tGrade(gradeBand(result.fleschKincaidGrade).key) },
    {
      key: "asl",
      label: t("averageWordsPerSentence"),
      value: f(result.averageWordsPerSentence, 2),
      note: `${f(result.wordCount)} ÷ ${f(result.sentenceCount)}`,
    },
    {
      key: "asw",
      label: t("averageSyllablesPerWord"),
      value: f(result.averageSyllablesPerWord, 2),
      note: `${f(result.syllableCount)} ÷ ${f(result.wordCount)}`,
    },
    { key: "words", label: t("wordCount"), value: f(result.wordCount), note: tl("hardNote", { n: f(hard), share: pct(result.wordCount ? hard / result.wordCount : 0) }) },
    {
      key: "sentences",
      label: t("sentenceCount"),
      value: f(result.sentenceCount),
      note: fragments ? tl("fragmentsNote", { n: f(fragments) }) : tl("longestNote", { n: f(longest) }),
    },
    { key: "syllables", label: t("syllableCount"), value: f(result.syllableCount), note: tl("perSentence", { n: f(result.sentenceCount ? result.syllableCount / result.sentenceCount : 0) }) },
  ];
  if (hardest) rows.push({ key: "hardest", label: tl("hardest"), value: f(hardest.ease), note: tl("sentenceRef", { n: f(hardest.index + 1), words: f(hardest.words) }) });
  if (easiest) rows.push({ key: "easiest", label: tl("easiest"), value: f(easiest.ease), note: tl("sentenceRef", { n: f(easiest.index + 1), words: f(easiest.words) }) });

  const sentence = `${t("fleschReadingEase")}: ${f(result.fleschReadingEase, 2)} (${bandLabel}), ${t("fleschKincaidGrade")}: ${f(result.fleschKincaidGrade, 2)}`;
  const exportRows = rows.filter((r) => r.key !== "fre").map((r) => ({ label: r.label, value: r.value }));
  const summaryText = [sentence, ...exportRows.map((r) => `${r.label}: ${r.value}`)].join("\n");

  const gauge = {
    domainMin: EASE_MIN,
    domainMax: EASE_MAX,
    value: clampEase(result.fleschReadingEase),
    zones: EASE_BANDS.map((b) => ({ from: b.from, to: b.to, color: b.color })),
    ticks: [-30, 0, 30, 60, 90, 100],
    valueLabel: f(result.fleschReadingEase, 2),
    caption: bandLabel,
  };

  return (
    <SectionCard phoneRole="output"
      title={t("heading")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-5 lg:flex lg:flex-1 lg:flex-col"
      action={
        ok ? (
          <div className="flex items-center gap-2">
            <CopyButton text={summaryText} />
            <ReadabilityShareExportModal
              inputRows={[]}
              resultRows={exportRows}
              heroLabel={t("fleschReadingEase")}
              heroValue={f(result.fleschReadingEase, 2)}
              sentence={sentence}
              gauge={gauge}
            />
          </div>
        ) : undefined
      }
    >
      {ok ? (
        <div className="flex flex-col gap-4 lg:flex-1 lg:flex-col-reverse">
          <table className="min-w-0 flex-1 border-collapse text-sm">
            <tbody>
              {rows.map((r) => {
                const target = r.key === "hardest" ? hardest : r.key === "easiest" ? easiest : undefined;
                const active = target != null && target.index === activeSentence;
                return (
                  <tr
                    key={r.key}
                    onClick={target ? () => selectSentence(target.index) : undefined}
                    className={`border-b border-zinc-200 last:border-0 dark:border-zinc-700/70 ${target ? "cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10" : ""} ${active ? "bg-amber-100/70 dark:bg-amber-500/15" : ""}`}
                  >
                    <th scope="row" className="py-1.5 pe-2 text-start align-top font-medium text-zinc-600 dark:text-zinc-300">
                      {r.label}
                      {r.note && <span className="block text-xs font-normal text-zinc-400 dark:text-zinc-500">{r.note}</span>}
                    </th>
                    <td
                      dir="ltr"
                      className={`py-1.5 text-end align-top font-mono font-semibold tabular-nums ${r.strong ? "text-xl text-blue-700 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}
                    >
                      {r.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ScoreDial />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {result.error === "no-sentences" ? t("noSentences") : t("emptyText")}
        </p>
      )}
    </SectionCard>
  );
}
