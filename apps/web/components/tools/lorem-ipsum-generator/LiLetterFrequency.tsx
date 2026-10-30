"use client";
import { useTranslations } from "next-intl";
import LiIndicatorCard from "./LiIndicatorCard";
import { ENGLISH_LETTERS, VOWELS } from "./liMath";
import { useLiLive } from "./LiLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const TOP = 12;
const W = 330;
const H = 140;
const PAD = 6;
const BOTTOM = 16;

/** Paired column chart (§31 #4): the text's most common letters against typical English frequencies — why greeking "looks like" real text. */
export default function LiLetterFrequency() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.letters");
  const { analysis: a, f, pct } = useLiLive();
  const letterTotal = a.letters.reduce((s, l) => s + l.count, 0);
  const total = letterTotal || 1;
  const top = a.letters.slice(0, TOP).map((l) => ({ ...l, share: l.count / total, english: (ENGLISH_LETTERS[l.letter] ?? 0) / 100 }));
  const max = Math.max(0.01, ...top.map((l) => Math.max(l.share, l.english)));
  const slot = (W - PAD * 2) / TOP;
  const plotH = H - BOTTOM - 8;
  const vowels = a.letters.filter((l) => VOWELS.has(l.letter)).reduce((s, l) => s + l.count, 0) / total;
  const englishVowels = [...VOWELS].reduce((s, l) => s + ENGLISH_LETTERS[l], 0) / 100;
  const first = top[0];

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {top.map((l, i) => {
          const x = PAD + i * slot;
          const h = (l.share / max) * plotH;
          const eh = (l.english / max) * plotH;
          return (
            <g key={l.letter}>
              <rect x={x + 3} y={H - BOTTOM - h} width={slot * 0.48} height={h} rx={2} className={VOWELS.has(l.letter) ? "fill-amber-500 dark:fill-amber-400" : "fill-blue-600 dark:fill-blue-500"} style={{ transition: "y 300ms ease, height 300ms ease" }}>
                <title>{`${l.letter}: ${pct(l.share)}`}</title>
              </rect>
              <rect x={x + 3 + slot * 0.48} y={H - BOTTOM - eh} width={slot * 0.3} height={eh} rx={2} className="fill-zinc-300 dark:fill-zinc-600" style={{ transition: "y 300ms ease, height 300ms ease" }}>
                <title>{`${t("legendEnglish")} ${l.letter}: ${pct(l.english)}`}</title>
              </rect>
              <text style={{ fontSize: svgPx(12) }} x={x + slot / 2} y={H - 4} textAnchor="middle" fontWeight={600} fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
                {l.letter}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-600 dark:bg-blue-500" />{t("legendText")}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500 dark:bg-amber-400" />{t("legendVowels")}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />{t("legendEnglish")}</li>
      </ul>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("top"), value: first ? `${first.letter} · ${pct(first.share)}` : "—", note: first ? t("englishNote", { share: pct(first.english) }) : undefined },
        { label: t("distinct"), value: `${f(a.letters.length)} / ${f(26)}` },
        { label: t("lettersTotal"), value: f(letterTotal) },
        { label: t("englishVowels"), value: pct(englishVowels) },
        { label: t("vowels"), value: pct(vowels), emphasize: true, note: t("vowelsNote") },
      ]}
    />
  );
}
