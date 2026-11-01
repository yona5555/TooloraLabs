"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { ReadabilityScoreCalculator } from "@tooloralabs/tools";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { PASSAGE_EXAMPLES } from "./passageExamples";
import { EASE_BANDS, EASE_MAX, EASE_MIN, clampEase, easeBand } from "./rsScales";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 150;
const PAD = 16;
const STRIP_Y = 66;
const STRIP_H = 26;
const TICKS = [-30, 0, 30, 50, 60, 70, 80, 90, 100];

const x = (v: number) => PAD + ((clampEase(v) - EASE_MIN) / (EASE_MAX - EASE_MIN)) * (W - PAD * 2);

// The four reference passages are fixed text, so their scores are computed once by the same calculator.
const tool = new ReadabilityScoreCalculator();
const REFERENCES = PASSAGE_EXAMPLES.map((p) => ({ key: p.key, score: tool.execute({ text: p.text }, { locale: "en-US" }).data.fleschReadingEase }));

/** Zone Strip (§31 #19) + Annotated Reference Points (§31 #20): your score among the 7 bands and 4 real reference passages. */
export default function RsEaseScale() {
  const t = useTranslations("tools.readability-score-calculator.scaleDiagram");
  const tl = useTranslations("tools.readability-score-calculator.live.scale");
  const tBands = useTranslations("tools.readability-score-calculator.result.bands");
  const tExamples = useTranslations("tools.readability-score-calculator.gauge.examples");
  const { result, f } = useRsLive();
  const score = result.fleschReadingEase;
  const band = easeBand(score);
  // Stagger reference labels on two rows so neighbours never overlap.
  const sorted = [...REFERENCES].sort((a, b) => a.score - b.score);

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tl("aria")} className="block max-w-full">
      {EASE_BANDS.map((b) => (
        <rect key={b.key} x={x(b.from)} y={STRIP_Y} width={x(b.to) - x(b.from)} height={STRIP_H} fill={b.color} opacity={b === band ? 1 : 0.4} style={{ transition: "opacity 300ms" }} />
      ))}
      {TICKS.map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={x(v)} y={STRIP_Y + STRIP_H + 12} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
          {f(v)}
        </text>
      ))}
      {sorted.map((r, i) => {
        const cx = x(r.score);
        const n = REFERENCES.findIndex((ref) => ref.key === r.key) + 1;
        const ly = i % 2 === 0 ? 18 : 40;
        return (
          <g key={r.key}>
            <line x1={cx} y1={ly + 8} x2={cx} y2={STRIP_Y} strokeDasharray="2 2" className="stroke-zinc-400 dark:stroke-zinc-500" />
            <circle cx={cx} cy={ly} r={8} className="fill-zinc-700 dark:fill-zinc-200" />
            <text style={{ fontSize: svgPx(12) }} x={cx} y={ly + 3.5} textAnchor="middle" fontWeight={700} className="fill-white dark:fill-zinc-900">
              {f(n)}
            </text>
          </g>
        );
      })}
      <g style={{ transform: `translateX(${x(score)}px)`, transition: "transform 450ms cubic-bezier(.3,1.3,.5,1)" }}>
        <path d={`M-7 ${STRIP_Y - 14} h14 l-7 10 z`} className="fill-blue-700 dark:fill-blue-300" />
        <line x1={0} y1={STRIP_Y - 4} x2={0} y2={STRIP_Y + STRIP_H + 2} strokeWidth={3} className="stroke-blue-700 dark:stroke-blue-300" />
      </g>
      <text style={{ fontSize: svgPx(12) }}
        x={Math.min(W - PAD, Math.max(PAD, x(score)))}
        y={H - 8}
        textAnchor={x(score) < 60 ? "start" : x(score) > W - 60 ? "end" : "middle"}
        fontWeight={800}
        className="fill-blue-700 dark:fill-blue-300"
      >
        {`${tl("you")} ${f(score)}`}
      </text>
    </svg>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={0} title={t("title")}>{indicator}</PhoneMini>}
      rows={[
        ...REFERENCES.map((r, i) => ({ label: `${f(i + 1)} · ${tExamples(r.key)}`, value: f(r.score), note: tBands(easeBand(r.score).key) })),
        { label: tl("you"), value: f(score), emphasize: true, note: tBands(band.key) },
      ]}
    />
  );
}
