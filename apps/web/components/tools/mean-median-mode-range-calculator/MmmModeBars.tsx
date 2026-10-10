"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

const W = 360;
const H = 200;
const TOP = 22;
const BASE = 168;

/** Type #1 (Labeled Bar Chart): how often each distinct value occurs; the tallest bar(s) are the mode. */
export default function MmmModeBars() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.modeBars");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const k = a.frequencies.length;
  const bw = (W - 20) / k;
  const sh = (c: number) => (c / a.maxFrequency) * (BASE - TOP);
  const modeSet = new Set(a.modes);
  const kind = a.modes.length === 0 ? t("kinds.none") : a.modes.length === 1 ? t("kinds.uni") : a.modes.length === 2 ? t("kinds.bi") : t("kinds.multi");

  const chart = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.frequencies.map((fr, i) => {
        const x = 10 + i * bw;
        const h = sh(fr.count);
        const mode = modeSet.has(fr.value);
        return (
          <g key={fr.value}>
            <rect x={x + bw * 0.12} y={BASE - h} width={bw * 0.76} height={h} rx={3} className={mode ? "fill-amber-500 dark:fill-amber-400" : "fill-blue-500 dark:fill-blue-400"} />
            <text x={x + bw / 2} y={BASE - h - 5} textAnchor="middle" fontSize={11} fontWeight={700} className={mode ? "fill-amber-700 dark:fill-amber-300" : "fill-zinc-700 dark:fill-zinc-200"}>
              {`×${fr.count}`}
            </text>
            <text x={x + bw / 2} y={BASE + 15} textAnchor="middle" fontSize={k > 10 ? 9 : 11} className="fill-zinc-600 dark:fill-zinc-300">
              {f(fr.value)}
            </text>
          </g>
        );
      })}
      <line x1={8} x2={W - 8} y1={BASE} y2={BASE} strokeWidth={1} className="stroke-zinc-300 dark:stroke-zinc-600" />
    </svg>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: t("distinct"), value: `${k} / ${a.n}` },
        { label: t("maxFreq"), value: `×${a.maxFrequency}` },
        { label: t("share"), value: `${a.maxFrequency} / ${a.n} = ${f((a.maxFrequency / a.n) * 100, 1)}%` },
        { label: t("kind"), value: kind },
        { label: tr("mode"), value: a.modes.length ? a.modes.map((m) => f(m)).join(", ") : tr("noMode"), emphasize: true },
      ]}
    />
  );
}
