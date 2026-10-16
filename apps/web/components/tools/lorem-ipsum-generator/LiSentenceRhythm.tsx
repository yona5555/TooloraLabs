"use client";
import { useTranslations } from "next-intl";
import { LOREM_WORDS_PER_SENTENCE as WPS } from "@tooloralabs/tools";
import LiIndicatorCard from "./LiIndicatorCard";
import { useLiLive } from "./LiLiveContext";

const W = 330;
const H = 150;
const PAD_L = 22;
const PAD_R = 6;
const TOP = 10;
const BOTTOM = 22;
const MAX_BARS = 48;

/** Column chart with a target band (§31 #3): words per sentence in order, against the generator's 5–14 band. Hover a bar for its paragraph. */
export default function LiSentenceRhythm() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.sentences");
  const { analysis: a, activeParagraph, f, pct } = useLiLive();
  const shown = a.sentences.slice(0, MAX_BARS);
  const top = Math.max(WPS.max + 2, ...shown.map((s) => s.words));
  const plotH = H - TOP - BOTTOM;
  const y = (v: number) => TOP + plotH - (v / top) * plotH;
  const slot = (W - PAD_L - PAD_R) / Math.max(shown.length, 1);
  const lengths = a.sentences.map((s) => s.words);
  const shortest = lengths.length ? Math.min(...lengths) : 0;
  const longest = lengths.length ? Math.max(...lengths) : 0;
  const inBand = lengths.filter((n) => n >= WPS.min && n <= WPS.max).length;
  const avg = lengths.length ? a.words / lengths.length : 0;

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <rect x={PAD_L} y={y(WPS.max)} width={W - PAD_L - PAD_R} height={y(WPS.min) - y(WPS.max)} className="fill-emerald-100 dark:fill-emerald-500/10" />
        {[WPS.min, WPS.max].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={y(v)} x2={W - PAD_R} y2={y(v)} strokeDasharray="3 3" className="stroke-emerald-500/70" />
            <text x={PAD_L - 4} y={y(v) + 3} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{f(v)}</text>
          </g>
        ))}
        {shown.map((s, i) => {
          const on = activeParagraph === s.paragraph;
          const out = s.words < WPS.min || s.words > WPS.max;
          return (
            <rect
              key={s.index}
              x={PAD_L + i * slot + slot * 0.15}
              y={y(s.words)}
              width={Math.max(1, slot * 0.7)}
              height={Math.max(1, TOP + plotH - y(s.words))}
              rx={Math.min(3, slot * 0.2)}
              className={on ? "fill-amber-500 dark:fill-amber-400" : out ? "fill-rose-500 dark:fill-rose-400" : s.paragraph % 2 ? "fill-sky-500 dark:fill-sky-400" : "fill-blue-600 dark:fill-blue-500"}
              style={{ transition: "y 300ms ease, height 300ms ease, x 300ms ease, width 300ms ease" }}
            >
              <title>{t("barTitle", { n: f(i + 1), words: f(s.words), p: f(s.paragraph + 1) })}</title>
            </rect>
          );
        })}
        <line x1={PAD_L} y1={TOP + plotH} x2={W - PAD_R} y2={TOP + plotH} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text x={PAD_L} y={H - 6} fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{f(1)}</text>
        <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">{f(shown.length)}</text>
      </svg>
      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        {t("legend", { min: f(WPS.min), max: f(WPS.max) })}
        {a.sentences.length > MAX_BARS && ` · ${t("capped", { n: f(MAX_BARS), total: f(a.sentences.length) })}`}
      </p>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("count"), value: f(a.sentences.length) },
        { label: t("shortest"), value: f(shortest) },
        { label: t("longest"), value: f(longest) },
        { label: t("average"), value: f(avg), note: `${f(a.words)} ÷ ${f(a.sentences.length)}` },
        { label: t("inBand"), value: pct(lengths.length ? inBand / lengths.length : 0), emphasize: true, note: `${f(inBand)} ÷ ${f(lengths.length)}` },
      ]}
    />
  );
}
