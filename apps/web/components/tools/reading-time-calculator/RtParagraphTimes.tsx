"use client";
import { useTranslations } from "next-intl";
import RtIndicatorCard from "./RtIndicatorCard";
import { SEGMENT_DOTS } from "./rtMath";
import { useRtLive } from "./RtLiveContext";

const MAX_ROWS = 10;

/** Ranked Horizontal Bar List (§31 #5) in reading order: time per paragraph and when it starts; click a row to select that paragraph in the text. */
export default function RtParagraphTimes() {
  const t = useTranslations("tools.reading-time-calculator.live.paragraphs");
  const { paragraphs, result, wpm, secondsFor, active, jumpTo, f, pct, clock } = useRtLive();
  const shown = paragraphs.slice(0, MAX_ROWS);
  const max = Math.max(1, ...shown.map((p) => p.words));
  const words = result.wordCount || 1;
  const selected = active?.kind === "paragraph" ? paragraphs[active.index] : undefined;
  const longest = paragraphs.reduce((b, p) => (p.words > (b?.words ?? -1) ? p : b), paragraphs[0]);
  const focus = selected ?? longest;

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
                onClick={() => jumpTo(p.start, p.end, { kind: "paragraph", index: p.index })}
                className={`grid w-full grid-cols-[2rem_1fr_3.25rem] items-center gap-2 rounded-lg px-1.5 py-1 text-start transition ${on ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${SEGMENT_DOTS[i % SEGMENT_DOTS.length]}`} />¶{f(i + 1)}
                </span>
                <span className="relative h-5 rounded bg-zinc-100 dark:bg-zinc-800">
                  <span
                    className={`absolute inset-y-0 start-0 rounded ${on ? "bg-amber-400" : SEGMENT_DOTS[i % SEGMENT_DOTS.length]}`}
                    style={{ width: `${(p.words / max) * 100}%`, transition: "width 300ms ease" }}
                  />
                  <span dir="ltr" className="absolute inset-y-0 end-1.5 flex items-center font-mono text-xs text-zinc-600 dark:text-zinc-200">
                    {t("startsAt", { time: clock(secondsFor(p.wordStart)) })}
                  </span>
                </span>
                <span dir="ltr" className="text-end font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{clock(secondsFor(p.words))}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
        {t("hint")}
        {paragraphs.length > MAX_ROWS && ` · ${t("capped", { n: f(MAX_ROWS), total: f(paragraphs.length) })}`}
      </p>
    </div>
  );

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={
        focus
          ? [
              { label: selected ? t("selected", { n: f(focus.index + 1) }) : t("longest", { n: f(focus.index + 1) }), value: t("words", { n: f(focus.words) }) },
              { label: t("time"), value: clock(secondsFor(focus.words)), note: `${f(focus.words)} ÷ ${f(wpm)} × ${f(60)}` },
              { label: t("starts"), value: clock(secondsFor(focus.wordStart)), note: t("startsNote", { n: f(focus.wordStart) }) },
              { label: t("count"), value: f(paragraphs.length) },
              { label: t("share"), value: pct(focus.words / words), emphasize: true, note: `${f(focus.words)} ÷ ${f(result.wordCount)}` },
            ]
          : [{ label: t("count"), value: f(0) }]
      }
    />
  );
}
