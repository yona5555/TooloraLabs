"use client";
import { useTranslations } from "next-intl";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { easeColor } from "./rsScales";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;
const LEFT = 30;
const RIGHT = 8;
const TOP = 18;
const BOTTOM = 164;
const BASE = 206.835;

/** Flow / Formula Diagram (§31 #18, waterfall form): 206.835 minus the sentence-length and word-length penalties = the score. */
export default function RsFormulaWaterfall() {
  const t = useTranslations("tools.readability-score-calculator.aboveFold.quickReference");
  const tl = useTranslations("tools.readability-score-calculator.live.formula");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, f } = useRsLive();
  const asl = result.averageWordsPerSentence;
  const asw = result.averageSyllablesPerWord;
  const sentencePenalty = 1.015 * asl;
  const wordPenalty = 84.6 * asw;
  const score = result.fleschReadingEase;

  const lo = Math.min(0, score) - 10;
  const hi = 220;
  const y = (v: number) => TOP + ((hi - v) / (hi - lo)) * (BOTTOM - TOP);
  const slot = (W - LEFT - RIGHT) / 4;
  const barW = slot * 0.62;
  const cols = [
    { key: "base", from: 0, to: BASE, fill: "#64748b", label: f(BASE, 1) },
    { key: "sentencePenalty", from: BASE - sentencePenalty, to: BASE, fill: "#f97316", label: `−${f(sentencePenalty, 1)}` },
    { key: "wordPenalty", from: score, to: BASE - sentencePenalty, fill: "#dc2626", label: `−${f(wordPenalty, 1)}` },
    { key: "score", from: Math.min(0, score), to: Math.max(0, score), fill: easeColor(score), label: f(score, 1) },
  ];

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tl("aria")} className="block max-w-full">
      {[0, 50, 100, 150, 200].map((v) => (
        <g key={v}>
          <line x1={LEFT} y1={y(v)} x2={W - RIGHT} y2={y(v)} className={v === 0 ? "stroke-zinc-400 dark:stroke-zinc-500" : "stroke-zinc-200 dark:stroke-zinc-700/70"} />
          <text style={{ fontSize: svgPx(12) }} x={LEFT - 4} y={y(v) + 3} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
            {f(v)}
          </text>
        </g>
      ))}
      {cols.map((c, i) => {
        const bx = LEFT + i * slot + (slot - barW) / 2;
        const top = y(c.to);
        const h = Math.max(1, y(c.from) - top);
        return (
          <g key={c.key}>
            <rect x={bx} y={top} width={barW} height={h} rx={3} fill={c.fill} style={{ transition: "y 400ms ease, height 400ms ease, fill 300ms" }} />
            {i < cols.length - 1 && (
              <line x1={bx + barW} y1={y(i === 0 ? BASE : c.from)} x2={bx + slot} y2={y(i === 0 ? BASE : c.from)} strokeDasharray="3 2" className="stroke-zinc-400 dark:stroke-zinc-500" />
            )}
            <text style={{ fontSize: svgPx(12) }} x={bx + barW / 2} y={top - 4} textAnchor="middle" fontWeight={800} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {c.label}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={bx + barW / 2} y={BOTTOM + 14} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {tl(`cols.${c.key}`)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={bx + barW / 2} y={BOTTOM + 26} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {i === 1 ? `1.015 × ${f(asl, 2)}` : i === 2 ? `84.6 × ${f(asw, 2)}` : i === 0 ? tl("constant") : "="}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("formulas.fleschReadingEase.label"), value: "", note: t("formulas.fleschReadingEase.expression") },
        { label: `1.015 × ${tr("averageWordsPerSentence")}`, value: f(sentencePenalty, 2), note: `1.015 × ${f(asl, 3)}` },
        { label: `84.6 × ${tr("averageSyllablesPerWord")}`, value: f(wordPenalty, 2), note: `84.6 × ${f(asw, 3)}` },
        { label: tr("fleschReadingEase"), value: f(score, 2), emphasize: true, note: `${f(BASE, 3)} − ${f(sentencePenalty, 2)} − ${f(wordPenalty, 2)}` },
        { label: t("formulas.fleschKincaidGrade.label"), value: f(result.fleschKincaidGrade, 2), note: t("formulas.fleschKincaidGrade.expression") },
      ]}
    />
  );
}
