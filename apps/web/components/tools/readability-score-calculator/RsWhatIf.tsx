"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { fleschKincaidGradeOf, fleschReadingEaseOf } from "@tooloralabs/tools";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { EASE_BANDS, EASE_MAX, EASE_MIN, clampEase, easeBand } from "./rsScales";

const W = 300;
const H = 168;
const CX = W / 2;
const CY = 136;
const R = 108;

const angle = (v: number) => Math.PI * (1 - (clampEase(v) - EASE_MIN) / (EASE_MAX - EASE_MIN));
const pt = (v: number, r: number) => [CX + r * Math.cos(angle(v)), CY - r * Math.sin(angle(v))] as const;
const deg = (v: number) => 180 - (angle(v) * 180) / Math.PI;

function arc(from: number, to: number, r: number) {
  const [x0, y0] = pt(from, r);
  const [x1, y1] = pt(to, r);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

const ASL_RANGE = [3, 40] as const;
const ASW_RANGE = [1, 2.5] as const;

/** Gradient Gauge (§31 #8) driven by two sliders: try shorter sentences or shorter words and watch the score move. */
export default function RsWhatIf() {
  const t = useTranslations("tools.readability-score-calculator.live.whatIf");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, f } = useRsLive();
  // null = follow the text; a value = the visitor's own what-if setting.
  const [aslOverride, setAsl] = useState<number | null>(null);
  const [aswOverride, setAsw] = useState<number | null>(null);
  const asl = aslOverride ?? result.averageWordsPerSentence;
  const asw = aswOverride ?? result.averageSyllablesPerWord;
  const ease = fleschReadingEaseOf(asl, asw);
  const grade = fleschKincaidGradeOf(asl, asw);
  const band = easeBand(ease);
  const delta = ease - result.fleschReadingEase;
  const touched = aslOverride != null || aswOverride != null;

  const slider = (label: string, value: number, range: readonly [number, number], step: number, set: (v: number) => void, digits: number) => (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {label}
        <span dir="ltr" className="font-mono text-sm text-blue-700 dark:text-blue-300">{f(value, digits)}</span>
      </span>
      <input
        type="range"
        dir="ltr"
        min={range[0]}
        max={range[1]}
        step={step}
        value={Math.min(range[1], Math.max(range[0], value))}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-1 w-full accent-blue-600"
      />
    </label>
  );

  const indicator = (
    <div className="w-full sm:w-[300px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
        {EASE_BANDS.map((b) => (
          <path key={b.key} d={arc(b.from, b.to, R)} fill="none" stroke={b.color} strokeWidth={18} opacity={b === band ? 1 : 0.4} />
        ))}
        {[-30, 0, 30, 60, 100].map((v) => {
          const [x, y] = pt(v, R + 17);
          return (
            <text key={v} x={x} y={y + 3} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(v)}
            </text>
          );
        })}
        {/* Ghost needle: your text as written. */}
        <g style={{ transform: `rotate(${deg(result.fleschReadingEase)}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 400ms ease" }}>
          <line x1={CX} y1={CY} x2={CX - R + 16} y2={CY} strokeWidth={3} strokeDasharray="4 3" strokeLinecap="round" className="stroke-zinc-400 dark:stroke-zinc-500" />
        </g>
        <g style={{ transform: `rotate(${deg(ease)}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 400ms cubic-bezier(.3,1.4,.5,1)" }}>
          <line x1={CX} y1={CY} x2={CX - R + 12} y2={CY} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
        </g>
        <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
        <text x={CX} y={CY - 36} textAnchor="middle" fontSize={26} fontWeight={800} fontFamily="ui-monospace, monospace" className="fill-zinc-900 dark:fill-zinc-50">
          {f(ease)}
        </text>
        <text x={CX} y={CY + 24} textAnchor="middle" fontSize={12} fontWeight={700} fill={band.color}>
          {tr(`bands.${band.key}`)}
        </text>
      </svg>
      <div className="mt-2 space-y-2">
        {slider(tr("averageWordsPerSentence"), asl, ASL_RANGE, 0.5, setAsl, 1)}
        {slider(tr("averageSyllablesPerWord"), asw, ASW_RANGE, 0.01, setAsw, 2)}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-amber-700 dark:text-amber-300">{t("hint")}</p>
        {touched && (
          <button
            type="button"
            onClick={() => {
              setAsl(null);
              setAsw(null);
            }}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={12} />
            {t("reset")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: `1.015 × ${tr("averageWordsPerSentence")}`, value: f(1.015 * asl, 2), note: `1.015 × ${f(asl, 2)}` },
        { label: `84.6 × ${tr("averageSyllablesPerWord")}`, value: f(84.6 * asw, 2), note: `84.6 × ${f(asw, 2)}` },
        { label: t("yourText"), value: f(result.fleschReadingEase), note: tr(`bands.${easeBand(result.fleschReadingEase).key}`) },
        { label: tr("fleschKincaidGrade"), value: f(grade) },
        { label: t("whatIfScore"), value: f(ease), emphasize: true, note: t("delta", { n: `${delta >= 0 ? "+" : "−"}${f(Math.abs(delta))}` }) },
      ]}
    />
  );
}
