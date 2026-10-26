"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import LoremShareExportModal from "./LoremShareExportModal";
import LiPageMockup from "./LiPageMockup";
import { useLiLive } from "./LiLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function LoremResult() {
  const t = useTranslations("tools.lorem-ipsum-generator");
  const tl = useTranslations("tools.lorem-ipsum-generator.live.table");
  const { result, ok, analysis: a, range, bankSize, unit, style, countValue, activeParagraph, selectParagraph, textBoxRef, f } = useLiLive();

  if (!ok) {
    return (
      <SectionCard phoneRole="output" title={t("result.heading")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm leading-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">{t("result.invalidCount")}</p>
      </SectionCard>
    );
  }

  const sentences = a.sentences.length;
  const paragraphs = a.paragraphs.length;
  const unique = a.vocabulary.length;
  const rows: Row[] = [
    {
      key: "words",
      label: t("result.wordCountLabel"),
      value: f(result.wordCount),
      strong: true,
      note: range && range.min !== range.max ? tl("rangeNote", { min: f(range.min), max: f(range.max) }) : undefined,
    },
    { key: "request", label: t("form.countLabel"), value: `${f(countValue)} × ${t(`form.units.${unit}`)}`, note: t(`form.styles.${style}`) },
    { key: "paragraphs", label: tl("paragraphs"), value: f(paragraphs) },
    { key: "sentences", label: tl("sentences"), value: f(sentences) },
    { key: "characters", label: tl("characters"), value: f(a.characters), note: tl("charactersNote") },
    { key: "noSpaces", label: tl("charactersNoSpaces"), value: f(a.charactersNoSpaces) },
    { key: "wps", label: tl("wordsPerSentence"), value: f(sentences ? a.words / sentences : 0), note: `${f(a.words)} ÷ ${f(sentences)}` },
    { key: "spp", label: tl("sentencesPerParagraph"), value: f(paragraphs ? sentences / paragraphs : 0), note: `${f(sentences)} ÷ ${f(paragraphs)}` },
    { key: "wordLength", label: tl("wordLength"), value: f(a.words ? a.totalLetters / a.words : 0, 2), note: `${f(a.totalLetters)} ÷ ${f(a.words)}` },
    { key: "unique", label: tl("uniqueWords"), value: f(unique), note: tl("uniqueNote", { bank: f(bankSize) }) },
  ];

  return (
    <SectionCard phoneRole="output"
      title={t("result.heading")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-5 lg:flex lg:flex-1 lg:flex-col"
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={result.text} />
          <LoremShareExportModal
            inputRows={[{ label: t("form.countLabel"), value: rows[1].value }]}
            resultRows={rows.map((r) => ({ label: r.label, value: r.value }))}
            heroLabel={t("result.heading")}
            heroValue={result.text}
            sentence={result.text}
          />
        </div>
      }
    >
      <div
        ref={textBoxRef}
        dir="auto"
        tabIndex={0} className="relative max-h-64 space-y-3 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm leading-7 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100"
      >
        {a.paragraphs.map((p) => {
          const on = activeParagraph === p.index;
          return (
            <p
              key={p.index}
              data-para={p.index}
              onClick={() => selectParagraph(on ? null : p.index)}
              className={`cursor-pointer rounded-lg px-1.5 transition-colors ${on ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15" : "hover:bg-blue-50 dark:hover:bg-blue-500/10"}`}
            >
              {a.text.slice(p.start, p.end)}
            </p>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">{tl("selectHint")}</p>

      <div className="mt-3 flex flex-col gap-4 lg:flex-1 lg:flex-col-reverse">
        <table className="min-w-0 flex-1 border-collapse text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-zinc-200 last:border-0 dark:border-zinc-700/70">
                <th scope="row" className="py-1.5 pe-2 text-start align-top font-medium text-zinc-600 dark:text-zinc-300">
                  {r.label}
                  {r.note && <span dir="auto" className="block text-[11px] font-normal text-zinc-400 dark:text-zinc-500">{r.note}</span>}
                </th>
                <td
                  dir={r.key === "request" ? "auto" : "ltr"}
                  className={`py-1.5 text-end align-top font-semibold tabular-nums ${r.strong ? "text-lg text-blue-700 dark:text-blue-400" : r.key === "request" ? "text-zinc-900 dark:text-zinc-100" : "font-mono text-zinc-900 dark:text-zinc-100"}`}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <LiPageMockup />
      </div>
    </SectionCard>
  );
}
