"use client";
import { useTranslations } from "next-intl";
import LiIndicatorCard from "./LiIndicatorCard";
import { SEGMENT_DOTS } from "./liMath";
import { useLiLive } from "./LiLiveContext";

const MAX_ROWS = 10;

/** Ranked Horizontal Bar List (§31 #5) in reading order: words per paragraph; click a row to select that paragraph in the generated text. */
export default function LiParagraphBars() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.paragraphs");
  const { analysis: a, activeParagraph, selectParagraph, f, pct } = useLiLive();
  const shown = a.paragraphs.slice(0, MAX_ROWS);
  const max = Math.max(1, ...shown.map((p) => p.words));
  const selected = activeParagraph !== null ? a.paragraphs[activeParagraph] : undefined;
  const largest = a.paragraphs.reduce((b, p) => (p.words > (b?.words ?? -1) ? p : b), a.paragraphs[0]);
  const focus = selected ?? largest;
  const avg = a.paragraphs.length ? a.words / a.paragraphs.length : 0;

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ul className="space-y-1.5">
        {shown.map((p, i) => {
          const on = selected === p;
          return (
            <li key={p.index}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => selectParagraph(on ? null : p.index, true)}
                className={`grid w-full grid-cols-[2rem_1fr_2.75rem] items-center gap-2 rounded-lg px-1.5 py-1 text-start transition ${on ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${SEGMENT_DOTS[i % SEGMENT_DOTS.length]}`} />¶{f(i + 1)}
                </span>
                <span className="relative h-5 rounded bg-zinc-100 dark:bg-zinc-800">
                  <span
                    className={`absolute inset-y-0 start-0 rounded ${on ? "bg-amber-400" : SEGMENT_DOTS[i % SEGMENT_DOTS.length]}`}
                    style={{ width: `${(p.words / max) * 100}%`, transition: "width 300ms ease" }}
                  />
                  <span dir="auto" className="absolute inset-y-0 end-1.5 flex items-center text-[10px] text-zinc-600 dark:text-zinc-200">
                    {t("sentencesShort", { n: f(p.sentences) })}
                  </span>
                </span>
                <span dir="ltr" className="text-end font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{f(p.words)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">
        {t("hint")}
        {a.paragraphs.length > MAX_ROWS && ` · ${t("capped", { n: f(MAX_ROWS), total: f(a.paragraphs.length) })}`}
      </p>
    </div>
  );

  return (
    <LiIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={
        focus
          ? [
              { label: selected ? t("selected", { n: f(focus.index + 1) }) : t("largest", { n: f(focus.index + 1) }), value: t("words", { n: f(focus.words) }) },
              { label: t("sentences"), value: f(focus.sentences), note: `${f(focus.words)} ÷ ${f(focus.sentences)} = ${f(focus.sentences ? focus.words / focus.sentences : 0)}` },
              { label: t("characters"), value: f(focus.characters) },
              { label: t("average"), value: f(avg), note: `${f(a.words)} ÷ ${f(a.paragraphs.length)}` },
              { label: t("share"), value: pct(a.words ? focus.words / a.words : 0), emphasize: true, note: `${f(focus.words)} ÷ ${f(a.words)}` },
            ]
          : []
      }
    />
  );
}
