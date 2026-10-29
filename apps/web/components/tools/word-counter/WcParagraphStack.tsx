"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";

const MAX_SEGMENTS = 10;
const COLORS = [
  "bg-blue-600 dark:bg-blue-500",
  "bg-sky-500 dark:bg-sky-400",
  "bg-indigo-500 dark:bg-indigo-400",
  "bg-cyan-600 dark:bg-cyan-500",
  "bg-violet-500 dark:bg-violet-400",
];

/** Stacked Segmented Bar (§31 #15): how the word count splits across paragraphs, in order. */
export default function WcParagraphStack() {
  const t = useTranslations("tools.word-counter.live.paragraphs");
  const { profile, stats, f, pct } = useWcLive();
  const paras = profile.paragraphs;
  const total = paras.reduce((a, p) => a + p.words, 0) || 1;
  const head = paras.slice(0, MAX_SEGMENTS);
  const restWords = paras.slice(MAX_SEGMENTS).reduce((a, p) => a + p.words, 0);
  const biggest = paras.reduce((b, p) => (p.words > (b?.words ?? -1) ? p : b), paras[0]);
  const avg = paras.length ? total / paras.length : 0;

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <div className="flex h-9 overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
        {head.map((p, i) => (
          <div
            key={p.index}
            className={`flex min-w-0 items-center justify-center border-e border-white/60 text-xs font-bold text-white last:border-0 dark:border-zinc-900/60 ${COLORS[i % COLORS.length]}`}
            style={{ width: `${(p.words / total) * 100}%`, transition: "width 250ms ease" }}
            title={t("segment", { n: f(i + 1), words: f(p.words) })}
          >
            {p.words / total > 0.08 && `¶${f(i + 1)}`}
          </div>
        ))}
        {restWords > 0 && <div className="bg-zinc-400 dark:bg-zinc-600" style={{ width: `${(restWords / total) * 100}%` }} />}
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {head.map((p, i) => (
          <li key={p.index} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <span className={`h-2.5 w-2.5 rounded-sm ${COLORS[i % COLORS.length]}`} />
              {t("label", { n: f(i + 1) })}
            </span>
            <span dir="ltr" className="font-mono text-zinc-800 dark:text-zinc-100">
              {t("detail", { words: f(p.words), sentences: f(p.sentences) })} · {pct(p.words / total)}
            </span>
          </li>
        ))}
        {restWords > 0 && (
          <li className="flex justify-between text-zinc-500">
            <span>{t("others", { n: f(paras.length - MAX_SEGMENTS) })}</span>
            <span dir="ltr" className="font-mono">{pct(restWords / total)}</span>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <WcIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("count"), value: f(stats.paragraphs) },
        { label: t("average"), value: f(avg), note: `${f(stats.words)} ÷ ${f(stats.paragraphs)}` },
        { label: t("largest"), value: biggest ? f(biggest.words) : "—", note: biggest ? t("label", { n: f(biggest.index + 1) }) : undefined },
        { label: t("share"), value: biggest ? pct(biggest.words / total) : "—", emphasize: true },
      ]}
    />
  );
}
