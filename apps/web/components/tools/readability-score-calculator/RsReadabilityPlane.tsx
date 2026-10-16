"use client";
import { useTranslations } from "next-intl";
import { fleschReadingEaseOf } from "@tooloralabs/tools";
import RsIndicatorCard from "./RsIndicatorCard";
import { useRsLive } from "./RsLiveContext";
import { EASE_BANDS, easeBand } from "./rsScales";

const W = 340;
const H = 230;
const L = 34;
const R = 10;
const T = 10;
const B = 34;
const X_MAX = 40;
const Y_MIN = 1;
const Y_MAX = 2.6;

type P = [number, number];

const px = (v: number) => L + (Math.min(X_MAX, Math.max(0, v)) / X_MAX) * (W - L - R);
const py = (v: number) => H - B - ((Math.min(Y_MAX, Math.max(Y_MIN, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * (H - T - B);

/** Keeps the part of `poly` where sign·(score − level) ≥ 0 (Sutherland–Hodgman against one straight iso-score line). */
function clip(poly: P[], level: number, sign: 1 | -1): P[] {
  const val = ([x, y]: P) => sign * (fleschReadingEaseOf(x, y) - level);
  const out: P[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const va = val(a);
    const vb = val(b);
    if (va >= 0) out.push(a);
    if ((va >= 0) !== (vb >= 0)) {
      const k = va / (va - vb);
      out.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]);
    }
  });
  return out;
}

const PLANE: P[] = [[0, Y_MIN], [X_MAX, Y_MIN], [X_MAX, Y_MAX], [0, Y_MAX]];
// The band regions are fixed straight stripes of the plane, computed once.
const REGIONS = EASE_BANDS.map((b) => {
  let poly = PLANE;
  if (b.key !== "very-confusing") poly = clip(poly, b.from, 1);
  if (b.key !== "very-easy") poly = clip(poly, b.to, -1);
  return { ...b, points: poly.map(([x, y]) => `${px(x)},${py(y)}`).join(" ") };
});

/** Annotated scatter over the band map: x = words per sentence, y = syllables per word; every sentence is a dot, your text the big one. */
export default function RsReadabilityPlane() {
  const t = useTranslations("tools.readability-score-calculator.live.plane");
  const tr = useTranslations("tools.readability-score-calculator.result");
  const { result, sentences, f, activeSentence, selectSentence } = useRsLive();
  const dots = sentences.filter((s) => s.terminated && s.words > 0);
  const band = easeBand(result.fleschReadingEase);
  const easy = dots.filter((s) => s.ease >= 70).length;
  const hard = dots.filter((s) => s.ease < 30).length;
  const active = activeSentence != null ? sentences[activeSentence] : undefined;

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {REGIONS.map((r) => (
          <polygon key={r.key} points={r.points} fill={r.color} opacity={r.key === band.key ? 0.42 : 0.18} style={{ transition: "opacity 300ms" }} />
        ))}
        {[0, 10, 20, 30, 40].map((v) => (
          <text key={v} x={px(v)} y={H - B + 13} textAnchor="middle" fontSize={8.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {f(v)}
          </text>
        ))}
        {[1, 1.4, 1.8, 2.2, 2.6].map((v) => (
          <text key={v} x={L - 4} y={py(v) + 3} textAnchor="end" fontSize={8.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {f(v)}
          </text>
        ))}
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="none" className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize={9} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
          {t("xAxis")}
        </text>
        <text x={10} y={(T + H - B) / 2} textAnchor="middle" fontSize={9} fontWeight={600} transform={`rotate(-90 10 ${(T + H - B) / 2})`} className="fill-zinc-600 dark:fill-zinc-300">
          {t("yAxis")}
        </text>
        <text x={L + 6} y={H - B - 6} fontSize={9} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{tr("bands.very-easy")}</text>
        <text x={W - R - 6} y={T + 12} textAnchor="end" fontSize={9} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{tr("bands.very-confusing")}</text>
        {dots.map((s) => {
          const on = s.index === activeSentence;
          return (
            <circle
              key={s.index}
              cx={px(s.words)}
              cy={py(s.syllables / s.words)}
              r={on ? 7 : 5}
              fill={easeBand(s.ease).color}
              strokeWidth={on ? 3 : 1.5}
              className={`cursor-pointer ${on ? "stroke-amber-400" : "stroke-white dark:stroke-zinc-900"}`}
              onClick={() => selectSentence(s.index)}
            >
              <title>{t("dotTitle", { n: f(s.index + 1), ease: f(s.ease) })}</title>
            </circle>
          );
        })}
        <g style={{ transform: `translate(${px(result.averageWordsPerSentence)}px, ${py(result.averageSyllablesPerWord)}px)`, transition: "transform 450ms cubic-bezier(.3,1.3,.5,1)" }}>
          <circle r={10} strokeWidth={3} className="fill-blue-700/25 stroke-blue-700 dark:fill-blue-300/25 dark:stroke-blue-300" />
          <circle r={2.5} className="fill-blue-700 dark:fill-blue-300" />
        </g>
      </svg>
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <RsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: tr("averageWordsPerSentence"), value: f(result.averageWordsPerSentence, 2), note: t("xNote") },
        { label: tr("averageSyllablesPerWord"), value: f(result.averageSyllablesPerWord, 2), note: t("yNote") },
        { label: t("easyDots"), value: f(easy), note: t("ofDots", { n: f(dots.length) }) },
        { label: t("hardDots"), value: f(hard), note: t("ofDots", { n: f(dots.length) }) },
        active && active.terminated && active.words > 0
          ? { label: t("selected", { n: f(active.index + 1) }), value: `${f(active.words)} · ${f(active.syllables / active.words, 2)}`, emphasize: true, note: tr(`bands.${easeBand(active.ease).key}`) }
          : { label: tr("fleschReadingEase"), value: f(result.fleschReadingEase), emphasize: true, note: tr(`bands.${band.key}`) },
      ]}
    />
  );
}
