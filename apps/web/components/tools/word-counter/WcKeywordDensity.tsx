"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

/** Ranked Horizontal Bar List (§31 #5): top keywords by density; clicking a row highlights that word inside the textarea. */
export default function WcKeywordDensity() {
  const t = useTranslations("tools.word-counter.live.keywords");
  const { profile, f, pct, highlight, setHighlight } = useWcLive();
  const list = profile.keywords;
  const max = Math.max(1, ...list.map((k) => k.count));
  const tokens = profile.wordLengths.reduce((a, b) => a + b, 0);
  const focus = list.find((k) => k.word === highlight) ?? list[0];

  const indicator = (
    <div className="w-full sm:w-[320px]">
      {list.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("none")}</p>
      ) : (
        <ul className="space-y-1.5">
          {list.map((k, i) => {
            const active = k.word === highlight;
            return (
              <li key={k.word}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setHighlight(active ? null : k.word)}
                  className={`grid w-full grid-cols-[1.25rem_6.5rem_1fr] items-center gap-2 rounded-lg px-1.5 py-1 text-start transition ${active ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  <span className="font-mono text-[11px] text-zinc-400">{f(i + 1)}</span>
                  <span dir="auto" className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{k.word}</span>
                  <span className="relative h-5 rounded bg-zinc-100 dark:bg-zinc-800">
                    <span
                      className={`absolute inset-y-0 start-0 rounded ${active ? "bg-amber-400" : i === 0 ? "bg-blue-600 dark:bg-blue-500" : "bg-blue-400 dark:bg-blue-600"}`}
                      style={{ width: `${(k.count / max) * 100}%`, transition: "width 300ms ease" }}
                    />
                    <span dir="ltr" className="absolute inset-y-0 end-1.5 flex items-center font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-100">
                      {f(k.count)} · {pct(k.density)}
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
    <WcIndicatorCard
      phoneRole="extra"
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={
        focus
          ? [
              { label: t("word"), value: focus.word },
              { label: t("occurrences"), value: f(focus.count) },
              { label: t("tokens"), value: f(tokens), note: t("tokensNote") },
              { label: t("density"), value: pct(focus.density), emphasize: true, note: `${f(focus.count)} ÷ ${f(tokens)} × 100` },
            ]
          : [{ label: t("tokens"), value: f(tokens) }]
      }
    />
  );
}
