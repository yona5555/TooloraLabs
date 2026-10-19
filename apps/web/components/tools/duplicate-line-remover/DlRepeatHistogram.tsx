"use client";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";

const W = 340;
const H = 210;
const TOP = 24;
const BASE = H - 36;
const LABELS = ["1×", "2×", "3×", "4×", "5×+"];

/** Type #1 (Labeled Bar Chart): how many distinct lines occur once, twice, three times and more. */
export default function DlRepeatHistogram() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.histogram");
  const { a, out, f, pct } = useDlModel();
  if (!a || !out) return <DlIndicatorUnavailable title={t("title")} />;

  const peak = Math.max(...a.repeatHistogram, 1);
  const slot = W / 5;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {a.repeatHistogram.map((c, i) => {
        const h = c ? Math.max(3, (c / peak) * (BASE - TOP)) : 0;
        const x = i * slot + slot * 0.2;
        const w = slot * 0.6;
        return (
          <g key={i}>
            {h > 0 && <rect x={x} y={BASE - h} width={w} height={h} rx={4} className={i === 0 ? "fill-emerald-500 dark:fill-emerald-400" : "fill-rose-500 dark:fill-rose-400"} />}
            <text x={x + w / 2} y={BASE - h - 6} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(c)}
            </text>
            <text x={x + w / 2} y={BASE + 18} textAnchor="middle" fontSize={12} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {LABELS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const repeated = out.uniqueLines - a.repeatHistogram[0];
  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("once"), value: f(a.repeatHistogram[0]) },
        { label: t("repeated"), value: f(repeated) },
        { label: t("repeatedShare"), value: pct(repeated, out.uniqueLines) },
        { label: t("top"), value: out.duplicates[0] ? `×${out.duplicates[0].count}` : "—" },
        { label: t("distinct"), value: f(out.uniqueLines), emphasize: true },
      ]}
    />
  );
}
