"use client";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";

const W = 340;
const H = 210;
const L = 32;
const R = 12;
const T = 14;
const B = 32;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): distinct lines seen so far against lines read.
 * Without repeats the curve would follow the dashed diagonal; every flat step is a duplicate.
 */
export default function DlUniqueCurve() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.curve");
  const { a, f, pct } = useDlModel();
  if (!a || a.lines.length === 0) return <DlIndicatorUnavailable title={t("title")} />;

  const n = a.uniqueSoFar.length;
  const x = (i: number) => L + (i / n) * (W - L - R);
  const y = (v: number) => H - B - (v / n) * (H - B - T);
  const line = [`M ${x(0)} ${y(0)}`, ...a.uniqueSoFar.map((v, i) => `L ${x(i + 1)} ${y(v)}`)].join(" ");
  const firstDup = a.lines.findIndex((l) => !l.kept && l.firstPosition < l.position);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={x(0)} y1={y(0)} x2={x(n)} y2={y(n)} strokeDasharray="5 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
      {[0, n].map((v) => (
        <text key={v} x={L - 6} y={y(v) + 4} textAnchor="end" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <path d={line} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {a.uniqueSoFar.map((v, i) => (
        <circle key={i} cx={x(i + 1)} cy={y(v)} r={a.lines[i].kept ? 3 : 4.5} className={a.lines[i].kept ? "fill-blue-600 dark:fill-blue-400" : "fill-rose-500"} />
      ))}
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </svg>
  );

  const unique = a.uniqueSoFar[n - 1];
  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("lines"), value: f(n) },
        { label: t("distinct"), value: f(unique) },
        { label: t("firstRepeat"), value: firstDup >= 0 ? t("lineN", { n: firstDup + 1 }) : "—" },
        { label: t("flat"), value: f(n - unique) },
        { label: t("ratio"), value: pct(unique, n), emphasize: true },
      ]}
    />
  );
}
