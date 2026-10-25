"use client";
import { useTranslations } from "next-intl";
import LiIndicatorCard from "./LiIndicatorCard";
import { useLiLive } from "./LiLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const TOP = 8;
const R = 30;
const SIZE = 76;

/** Ranked bars + coverage ring (§31 #5 + #6): the most repeated words and how much of the style's word bank the text uses. */
export default function LiVocabulary() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.vocab");
  const tf = useTranslations("tools.lorem-ipsum-generator.form");
  const { analysis: a, bankSize, style, f, pct } = useLiLive();
  const unique = a.vocabulary.length;
  const top = a.vocabulary.slice(0, TOP);
  const max = Math.max(1, top[0]?.count ?? 1);
  const coverage = bankSize ? Math.min(1, unique / bankSize) : 0;
  const circ = 2 * Math.PI * R;

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <div className="flex items-center gap-4">
        <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")} className="shrink-0">
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" strokeWidth={9} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={`${coverage * circ} ${circ}`}
              className="stroke-emerald-500 dark:stroke-emerald-400"
              style={{ transition: "stroke-dasharray 400ms ease" }}
            />
          </g>
          <text style={{ fontSize: svgPx(13) }} x={SIZE / 2} y={SIZE / 2 + 4} textAnchor="middle" fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">{pct(coverage)}</text>
        </svg>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("ring", { unique: f(unique), bank: f(bankSize), style: tf(`styles.${style}`) })}
        </p>
      </div>
      <ul className="mt-3 space-y-1">
        {top.map((w, i) => (
          <li key={w.word} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-xs">
            <span dir="ltr" className="truncate text-start font-mono text-zinc-700 dark:text-zinc-200">{w.word}</span>
            <span className="h-3 rounded bg-zinc-100 dark:bg-zinc-800">
              <span
                className={`block h-full rounded ${i === 0 ? "bg-amber-500 dark:bg-amber-400" : "bg-blue-600 dark:bg-blue-500"}`}
                style={{ width: `${(w.count / max) * 100}%`, transition: "width 300ms ease" }}
              />
            </span>
            <span dir="ltr" className="text-end font-mono font-semibold text-zinc-800 dark:text-zinc-100">×{f(w.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("unique"), value: f(unique) },
        { label: t("bank"), value: f(bankSize), note: tf(`styles.${style}`) },
        { label: t("coverage"), value: pct(coverage), note: `${f(unique)} ÷ ${f(bankSize)}` },
        { label: t("top"), value: top[0] ? `${top[0].word} ×${f(top[0].count)}` : "—" },
        { label: t("repetition"), value: f(unique ? a.words / unique : 0, 2), emphasize: true, note: `${f(a.words)} ÷ ${f(unique)}` },
      ]}
    />
  );
}
