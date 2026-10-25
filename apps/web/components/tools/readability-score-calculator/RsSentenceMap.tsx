"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { easeBand } from "./rsScales";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 176;
const PAD_X = 16;
const TOP = 16;
const BASE = 146;
const MAX_BARS = 60;

/** Labeled Bar Chart (§31 #1), interactive: one bar per sentence (height = words, colour = its own Reading Ease band); click to select it in the text. */
export default function RsSentenceMap() {
  const svgId = useId();
  const t = useTranslations("tools.readability-score-calculator.live.sentences");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { sentences, text, f, activeSentence, selectSentence } = useRsLive();
  const shown = sentences.slice(0, MAX_BARS);
  const max = Math.max(10, ...shown.map((s) => s.words));
  const slot = (W - PAD_X * 2) / Math.max(shown.length, 1);
  const barW = Math.max(3, Math.min(28, slot * 0.72));
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const counted = sentences.filter((s) => s.terminated && s.words > 0);
  const hardest = counted.reduce<(typeof counted)[number] | undefined>((a, s) => (!a || s.ease < a.ease ? s : a), undefined);
  const focus = (activeSentence != null ? sentences[activeSentence] : undefined) ?? hardest;
  const excerpt = focus ? text.slice(focus.start, focus.end) : "";

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <defs>
          <pattern id={`${svgId}rs-fragment`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" className="fill-zinc-200 dark:fill-zinc-700" />
            <line x1="0" y1="0" x2="0" y2="5" strokeWidth="2" className="stroke-zinc-400 dark:stroke-zinc-500" />
          </pattern>
        </defs>
        {shown.map((s, i) => {
          const x = PAD_X + i * slot + (slot - barW) / 2;
          const isFocus = focus?.index === s.index;
          const fill = s.terminated ? easeBand(s.ease).color : `url(#${svgId}rs-fragment)`;
          return (
            <g key={s.index} className="cursor-pointer" onClick={() => selectSentence(s.index)}>
              <rect x={PAD_X + i * slot} y={TOP} width={slot} height={BASE - TOP} fill="transparent" />
              <rect
                x={x}
                y={y(s.words)}
                width={barW}
                height={BASE - y(s.words)}
                rx={2}
                fill={fill}
                stroke={isFocus ? "#f59e0b" : "none"}
                strokeWidth={isFocus ? 3 : 0}
                opacity={focus && !isFocus ? 0.75 : 1}
                style={{ transition: "y 250ms ease, height 250ms ease, opacity 200ms" }}
              >
                <title>{t("barTitle", { n: f(s.index + 1), words: f(s.words) })}</title>
              </rect>
              {shown.length <= 24 && (
                <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={y(s.words) - 4} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {s.terminated ? f(s.ease, 0) : "×"}
                </text>
              )}
            </g>
          );
        })}
        <line x1={PAD_X} y1={BASE} x2={W - PAD_X} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text style={{ fontSize: svgPx(12) }} x={PAD_X} y={BASE + 14} className="fill-zinc-500 dark:fill-zinc-400">{`#${f(1)}`}</text>
        <text style={{ fontSize: svgPx(12) }} x={W - PAD_X} y={BASE + 14} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{`#${f(shown.length)}`}</text>
        <text style={{ fontSize: svgPx(12) }} x={W / 2} y={BASE + 26} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
      </svg>
      {focus && (
        <blockquote dir="auto" className="mt-1 line-clamp-3 border-s-4 border-amber-400 ps-2 text-xs italic leading-5 text-zinc-600 dark:text-zinc-300">
          {excerpt}
        </blockquote>
      )}
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
        {t("hint")}
        {sentences.length > MAX_BARS && ` · ${t("capped", { n: f(MAX_BARS), total: f(sentences.length) })}`}
      </p>
    </div>
  );

  const rows = focus
    ? [
        { label: t("selected", { n: f(focus.index + 1) }), value: focus.terminated ? (focus === hardest && activeSentence == null ? t("hardestTag") : t("counted")) : t("notCounted"), note: focus.terminated ? undefined : t("notCountedNote") },
        { label: tr("wordCount"), value: f(focus.words) },
        { label: tr("syllableCount"), value: f(focus.syllables) },
        { label: tr("averageSyllablesPerWord"), value: f(focus.words ? focus.syllables / focus.words : 0, 2), note: `${f(focus.syllables)} ÷ ${f(focus.words)}` },
        ...(focus.terminated
          ? [
              { label: tr("fleschKincaidGrade"), value: f(focus.grade, 1) },
              { label: tr("fleschReadingEase"), value: f(focus.ease, 1), emphasize: true, note: tr(`bands.${easeBand(focus.ease).key}`) },
            ]
          : []),
      ]
    : [{ label: tr("sentenceCount"), value: f(counted.length) }];

  return <RsIndicatorCard title={t("title")} intro={t("intro")} indicator={indicator} rows={rows} />;
}
