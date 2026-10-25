"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { GRADE_BANDS, GRADE_MAX, gradeBand } from "./rsScales";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 176;
const PAD = 14;
const BASE = 150;
const STEP = 22;

const x = (g: number) => PAD + (Math.min(GRADE_MAX, Math.max(0, g)) / GRADE_MAX) * (W - PAD * 2);
const topOf = (i: number) => BASE - STEP * (i + 1);

/** Stepped Diagram (§31 #13): the Flesch-Kincaid grade climbing the U.S. school stages. */
export default function RsGradeLadder() {
  const t = useTranslations("tools.readability-score-calculator.gradeLevelDiagram");
  const tl = useTranslations("tools.readability-score-calculator.live.grade");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, f } = useRsLive();
  const grade = result.fleschKincaidGrade;
  const band = gradeBand(grade);
  const idx = GRADE_BANDS.indexOf(band);
  const asl = result.averageWordsPerSentence;
  const asw = result.averageSyllablesPerWord;

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tl("aria")} className="block max-w-full">
        {GRADE_BANDS.map((b, i) => (
          <g key={b.key}>
            <rect x={x(b.from)} y={topOf(i)} width={x(b.to) - x(b.from) - 1} height={BASE - topOf(i)} rx={3} fill={b.color} opacity={b === band ? 1 : 0.35} style={{ transition: "opacity 300ms" }} />
            <text style={{ fontSize: svgPx(12) }} x={(x(b.from) + x(b.to)) / 2} y={BASE - 6} textAnchor="middle" fontWeight={700} className="fill-white">
              {`${f(b.from)}–${f(b.to)}`}
            </text>
          </g>
        ))}
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} className="stroke-zinc-400 dark:stroke-zinc-500" />
        <g style={{ transform: `translate(${x(grade)}px, ${topOf(idx)}px)`, transition: "transform 450ms cubic-bezier(.3,1.3,.5,1)" }}>
          <line x1={0} y1={0} x2={0} y2={-22} strokeWidth={2} className="stroke-zinc-800 dark:stroke-zinc-100" />
          <path d="M0 -22 l14 5 l-14 5 z" className="fill-blue-700 dark:fill-blue-300" />
          <circle cx={0} cy={0} r={4} className="fill-zinc-800 dark:fill-zinc-100" />
        </g>
        <text style={{ fontSize: svgPx(20) }} x={W - PAD} y={16} textAnchor="end" fontWeight={800} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-50">
          {f(grade)}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={W - PAD} y={30} textAnchor="end" fontWeight={700} fill={band.color}>
          {tl("gradeLabel")}
        </text>
      </svg>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {GRADE_BANDS.map((b) => (
          <li key={b.key} className={`flex items-center gap-1.5 ${b === band ? "font-bold text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.color }} />
            {t(`bands.${b.key}`)}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={1} title={t("title")}>{indicator}</PhoneMini>}
      rows={[
        { label: `0.39 × ${tr("averageWordsPerSentence")}`, value: f(0.39 * asl, 2), note: `0.39 × ${f(asl, 2)}` },
        { label: `11.8 × ${tr("averageSyllablesPerWord")}`, value: f(11.8 * asw, 2), note: `11.8 × ${f(asw, 3)}` },
        { label: tl("constant"), value: f(-15.59, 2) },
        { label: tr("fleschKincaidGrade"), value: f(grade, 2), emphasize: true, note: grade < 0 ? tl("belowK") : t(`bands.${band.key}`) },
      ]}
    />
  );
}
